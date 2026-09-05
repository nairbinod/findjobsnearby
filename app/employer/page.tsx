"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { buildJobHref } from "@/lib/geo";
import ReportButton from "@/components/ReportButton";
import MessageThread from "@/components/MessageThread";
import AuthNav from "@/components/AuthNav";
import { unwrapEmbed } from "@/lib/postgrest";

type EmployerJob = { id: string; title: string; company_name: string; city: string; state: string; pay_range: string; status: string; created_at: string; expires_at: string | null; urgent: boolean; requirements: string[] | null };
type CandidateProfile = { id: string; role_title: string; category: string | null; availability: string | null; available_from: string | null; available_until: string | null; curated_content: string | null };
// PostgREST returns this embed as a single object, not a one-item array --
// keep the raw union here and unwrap with unwrapEmbed at the point of use.
type Applicant = { id: string; created_at: string; candidate_id: string; withdrawn_at: string | null; requirement_matches: string[] | null; requirement_notes: string | null; candidate_profiles: CandidateProfile | CandidateProfile[] | null };
type UnlockedDetails = { workHistory: string | null; desiredPay: string | null; email: string | null; phone: string | null };

const jobCategories = ["Food & hospitality", "Skilled trades", "Care & education", "Operations"] as const;

function formatWindow(from: string | null, until: string | null) {
  if (!from && !until) return null;
  const fmt = (value: string) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (from && until) return `${fmt(from)} – ${fmt(until)}`;
  return from ? `From ${fmt(from)}` : `Through ${fmt(until!)}`;
}

export default function EmployerPage() {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [message, setMessage] = useState("Loading your jobs...");

  const [employerId, setEmployerId] = useState("");
  const [freeViewsUsed, setFreeViewsUsed] = useState(0);
  const [unlockedCandidateIds, setUnlockedCandidateIds] = useState<Set<string>>(new Set());
  const [unlockedDetails, setUnlockedDetails] = useState<Record<string, UnlockedDetails>>({});
  const [unlockingCandidateId, setUnlockingCandidateId] = useState<string | null>(null);
  const [unlockMessage, setUnlockMessage] = useState("");
  // Bumped on every applicants refetch and used as part of MessageThread's
  // key -- it doesn't refetch on its own otherwise, since its own props
  // (employerId/candidateId) never change between refreshes.
  const [refreshToken, setRefreshToken] = useState(0);

  async function loadUnlockedDetails(candidateId: string) {
    const response = await fetch(`/api/candidates/${candidateId}/unlocked-profile`);
    if (!response.ok) return;
    const data = await response.json();
    setUnlockedDetails((current) => ({ ...current, [candidateId]: data }));
  }

  async function showApplicants(jobId: string) {
    setSelectedJob(jobId);
    setCategoryFilter("All");
    setAvailabilityFilter("");
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("applications").select("id, created_at, candidate_id, withdrawn_at, requirement_matches, requirement_notes, candidate_profiles(id, role_title, category, availability, available_from, available_until, curated_content)").eq("job_id", jobId).order("created_at", { ascending: false });
    if (error) { setMessage(error.message); return; }
    const rows = (data as unknown as Applicant[]) ?? [];
    setApplicants(rows);
    setApplicationCounts((counts) => ({ ...counts, [jobId]: rows.filter((row) => !row.withdrawn_at).length }));
    for (const row of rows) {
      if (unlockedCandidateIds.has(row.candidate_id) && !unlockedDetails[row.candidate_id]) void loadUnlockedDetails(row.candidate_id);
    }
    setRefreshToken((token) => token + 1);
  }

  async function unlockProfile(candidateId: string, applicationId: string) {
    setUnlockingCandidateId(candidateId);
    setUnlockMessage("");
    try {
      const response = await fetch("/api/unlock-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, applicationId }),
      });
      const result = await response.json();
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      if (result.unlocked) {
        setUnlockedCandidateIds((ids) => new Set(ids).add(candidateId));
        if (result.free) setFreeViewsUsed((n) => Math.min(2, n + 1));
        await loadUnlockedDetails(candidateId);
      } else if (result.error) {
        setUnlockMessage(result.error);
      }
    } finally {
      setUnlockingCandidateId(null);
    }
  }

  async function closeJob(jobId: string) {
    if (!window.confirm("Close this listing? It will stop accepting applications and disappear from search — this can't be undone.")) return;
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("jobs").update({ status: "closed" }).eq("id", jobId).select("id");
    if (error) { setMessage(error.message); return; }
    if (!data || data.length === 0) { setMessage("Could not close this listing — it may no longer belong to your account."); return; }
    setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, status: "closed" } : job)));
  }

  // US-31: an expired listing stopped being shown to candidates automatically
  // (see the expire-listings cron) -- renewing republishes it for another 30
  // days rather than making the employer re-post from scratch.
  async function renewJob(jobId: string) {
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("jobs").update({ status: "published", expires_at: newExpiresAt }).eq("id", jobId).select("id");
    if (error) { setMessage(error.message); return; }
    if (!data || data.length === 0) { setMessage("Could not renew this listing — it may no longer belong to your account."); return; }
    setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, status: "published", expires_at: newExpiresAt } : job)));
  }

  useEffect(() => {
    async function loadJobs() {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { setMessage("Sign in with your employer account to manage jobs."); return; }
      setEmployerId(userData.user.id);
      const [{ data, error }, { data: unlocks }, { data: account }] = await Promise.all([
        supabase.from("jobs").select("id, title, company_name, city, state, pay_range, status, created_at, expires_at, urgent, requirements").eq("employer_id", userData.user.id).order("created_at", { ascending: false }),
        supabase.from("paid_profile_views").select("candidate_id").eq("employer_id", userData.user.id),
        supabase.from("accounts").select("free_views_used").eq("id", userData.user.id).maybeSingle(),
      ]);
      if (error) { setMessage(error.message); return; }
      setJobs(data ?? []);
      setMessage(data?.length ? "" : "You have not posted a job yet.");
      setUnlockedCandidateIds(new Set((unlocks ?? []).map((u) => u.candidate_id)));
      setFreeViewsUsed(account?.free_views_used ?? 0);

      if (new URLSearchParams(window.location.search).get("unlocked")) {
        setUnlockMessage("Payment received — refreshing your unlocked profiles...");
        setTimeout(() => void loadJobs(), 2500);
      }

      const [viewCountEntries, applicationCountEntries] = await Promise.all([
        Promise.all((data ?? []).map(async (job) => {
          const { count } = await supabase.from("job_views").select("*", { count: "exact", head: true }).eq("job_id", job.id);
          return [job.id, count ?? 0] as const;
        })),
        Promise.all((data ?? []).map(async (job) => {
          const { count } = await supabase.from("applications").select("*", { count: "exact", head: true }).eq("job_id", job.id).is("withdrawn_at", null);
          return [job.id, count ?? 0] as const;
        })),
      ]);
      setViewCounts(Object.fromEntries(viewCountEntries));
      setApplicationCounts(Object.fromEntries(applicationCountEntries));

      // Seeing applicants (and messaging an unlocked one) is the entire
      // point of this dashboard -- don't make that a hidden extra click.
      // Auto-open the job with the most applicants so it's visible on load.
      const [topJobId, topCount] = applicationCountEntries.reduce((best, entry) => (entry[1] > best[1] ? entry : best), ["", 0] as readonly [string, number]);
      if (topCount > 0) void showApplicants(topJobId);
    }
    void loadJobs();
    // showApplicants is intentionally omitted -- this should only run once on
    // mount, not re-run every time showApplicants is redefined by a render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleApplicants = useMemo(() => applicants.filter((applicant) => {
    const profile = unwrapEmbed(applicant.candidate_profiles);
    const matchesCategory = categoryFilter === "All" || profile?.category === categoryFilter;
    const matchesAvailability = !availabilityFilter || (profile?.availability ?? "").toLowerCase().includes(availabilityFilter.toLowerCase());
    return matchesCategory && matchesAvailability;
  }), [applicants, categoryFilter, availabilityFilter]);

  const freeViewsLeft = Math.max(0, 2 - freeViewsUsed);

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-6 lg:px-10"><a href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></a><div className="flex items-center gap-5"><AuthNav /><a href="/post" className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white">Post a job <span aria-hidden="true">↗</span></a></div></header>
      <main className="mx-auto max-w-[1100px] px-6 pb-20 pt-12 lg:px-10">
        <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Employer workspace</p>
        <h1 className="display text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">Your local<br />hiring board.</h1>
        {unlockMessage && <p role="status" className="mt-4 rounded-xl bg-[var(--mint)] px-4 py-3 text-sm font-semibold">{unlockMessage}</p>}
        {message && !jobs.length ? (
          <div className="mt-12 rounded-2xl border border-[var(--line)] bg-white p-8"><p className="text-lg font-semibold">{message}</p><a href="/auth" className="mt-5 inline-block rounded-full bg-[var(--coral)] px-6 py-3 text-sm font-bold text-white">Sign in <span aria-hidden="true">→</span></a></div>
        ) : (
          <section className="mt-12">
            <div className="flex items-end justify-between"><h2 className="display text-3xl font-bold">Your listings</h2><span className="text-sm text-[var(--muted)]">{jobs.length} total</span></div>
            {freeViewsLeft > 0 && <p className="mt-3 text-sm font-semibold text-[var(--coral)]">{freeViewsLeft} free profile unlock{freeViewsLeft === 1 ? "" : "s"} remaining on your account.</p>}
            <div className="mt-6 space-y-3">
              {jobs.map((job) => (
                <article key={job.id} className="rounded-2xl border border-[var(--line)] bg-white p-5">
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      {job.urgent && <span className="mb-1.5 inline-block rounded-full bg-[var(--coral)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Urgently hiring</span>}
                      <h3 className="text-xl font-bold">{job.title}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">{job.company_name} · {job.city} · {job.pay_range}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3"><span className="text-xs font-semibold uppercase tracking-wider text-[var(--coral)]">{job.status}</span><span className="text-xs text-[var(--muted)]">{viewCounts[job.id] ?? 0} unique view{(viewCounts[job.id] ?? 0) === 1 ? "" : "s"}</span><span className="text-xs text-[var(--muted)]">· {applicationCounts[job.id] ?? 0} applicant{(applicationCounts[job.id] ?? 0) === 1 ? "" : "s"}</span></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">{(applicationCounts[job.id] ?? 0) > 0 ? <button onClick={() => (selectedJob === job.id ? setSelectedJob(null) : void showApplicants(job.id))} className="rounded-full bg-[var(--coral)] px-4 py-2 text-sm font-bold text-white">{selectedJob === job.id ? "Hide applicants" : `View ${applicationCounts[job.id]} applicant${applicationCounts[job.id] === 1 ? "" : "s"}`} <span aria-hidden="true">→</span></button> : <button onClick={() => void showApplicants(job.id)} className="text-sm font-bold text-[var(--ink)]">Applicants →</button>}<a href={buildJobHref(job.id, job.title, job.city, job.state)} className="text-sm font-bold text-[var(--coral)]">View listing →</a><a href={`/employer/jobs/${job.id}/edit`} className="text-sm font-bold text-[var(--ink)]">Edit →</a><a href={`/api/jobs/${job.id}/share-card`} className="text-sm font-bold text-[var(--muted)]">Download image ↓</a>{job.status === "published" && <button onClick={() => void closeJob(job.id)} className="text-sm font-bold text-[var(--muted)]">Close listing</button>}{job.status === "expired" && <button onClick={() => void renewJob(job.id)} className="text-sm font-bold text-[var(--coral)]">Renew for 30 more days →</button>}</div>
                  </div>
                  {selectedJob === job.id && (
                    <div className="mt-5 border-t border-[var(--line)] pt-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="font-bold">Applicants</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[var(--muted)]">{applicants.length}/30 applications</span>
                          {/* This list only loads when opened -- a new applicant, an
                              approved profile, or a reply won't show up here on their
                              own, so a manual refresh is the only way to see them. */}
                          <button onClick={() => void showApplicants(job.id)} className="text-xs font-bold text-[var(--coral)]">Refresh</button>
                        </div>
                      </div>
                      {applicants.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-3">
                          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold outline-none">
                            <option value="All">All categories</option>
                            {jobCategories.map((item) => <option key={item} value={item}>{item}</option>)}
                          </select>
                          <input value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)} placeholder="Filter by availability" className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-[var(--coral)]" />
                        </div>
                      )}
                      {applicants.length === 0 ? (
                        <p className="mt-4 text-sm text-[var(--muted)]">No applications yet.</p>
                      ) : (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {visibleApplicants.map((applicant) => {
                            const profile = unwrapEmbed(applicant.candidate_profiles);
                            const isUnlocked = unlockedCandidateIds.has(applicant.candidate_id);
                            const details = unlockedDetails[applicant.candidate_id];
                            const isWithdrawn = Boolean(applicant.withdrawn_at);
                            return (
                              <div key={applicant.id} className={`rounded-xl bg-[var(--cream)] p-4 ${isWithdrawn ? "opacity-60" : ""}`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-bold">{profile?.role_title ?? "Focused profile"}</p>
                                    <p className="mt-1 text-sm text-[var(--muted)]">Available: {profile?.availability ?? "Not specified"}{profile?.category ? ` · ${profile.category}` : ""}</p>
                                    {profile && formatWindow(profile.available_from, profile.available_until) && <p className="mt-1 text-xs font-semibold text-[var(--coral)]">{formatWindow(profile.available_from, profile.available_until)}</p>}
                                  </div>
                                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase">{isWithdrawn ? "Withdrawn" : isUnlocked ? "Unlocked" : "Preview"}</span>
                                </div>
                                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{profile?.curated_content ?? "Candidate profile pending approval."}</p>
                                <p className="mt-3 text-xs text-[var(--muted)]">Applied {new Date(applicant.created_at).toLocaleDateString()}{isWithdrawn && ` · Withdrawn ${new Date(applicant.withdrawn_at!).toLocaleDateString()}`}</p>

                                {/* US-61: informational only -- never used to sort, rank,
                                    filter, or hide applicants. Self-reported by the
                                    candidate, not independently verified. */}
                                {job.requirements && job.requirements.length > 0 && (
                                  <div className="mt-3 rounded-lg bg-white p-3 text-xs">
                                    <p className="font-bold text-[var(--ink)]">{applicant.requirement_matches?.length ?? 0} of {job.requirements.length} requirements met</p>
                                    <ul className="mt-1.5 space-y-1 text-[var(--muted)]">
                                      {job.requirements.map((item) => <li key={item}>{applicant.requirement_matches?.includes(item) ? "☑" : "☐"} {item}</li>)}
                                    </ul>
                                    {applicant.requirement_notes && <p className="mt-2 border-t border-[var(--line)] pt-2 leading-5 text-[var(--muted)]">&ldquo;{applicant.requirement_notes}&rdquo;</p>}
                                  </div>
                                )}

                                {isUnlocked ? (
                                  <div className="mt-4 space-y-2 rounded-lg bg-white p-3 text-sm">
                                    {details ? (
                                      <>
                                        {details.workHistory && <p><span className="font-bold">Work history:</span> {details.workHistory}</p>}
                                        {details.desiredPay && <p><span className="font-bold">Desired pay:</span> {details.desiredPay}</p>}
                                        {details.email && <p><span className="font-bold">Email:</span> {details.email}</p>}
                                        {details.phone && <p><span className="font-bold">Phone:</span> {details.phone}</p>}
                                      </>
                                    ) : <p className="text-[var(--muted)]">Loading details...</p>}
                                  </div>
                                ) : null}
                                {isUnlocked && employerId && (
                                  <MessageThread key={`${applicant.candidate_id}-${refreshToken}`} employerId={employerId} candidateId={applicant.candidate_id} viewerId={employerId} counterpartLabel="candidate" />
                                )}
                                {!isUnlocked && (isWithdrawn ? (
                                  <p className="mt-4 text-xs text-[var(--muted)]">This candidate withdrew their application.</p>
                                ) : (
                                  <div className="mt-4 flex items-center justify-between gap-3">
                                    <button onClick={() => void unlockProfile(applicant.candidate_id, applicant.id)} disabled={unlockingCandidateId === applicant.candidate_id} className="text-xs font-bold text-[var(--coral)] disabled:opacity-60">
                                      {unlockingCandidateId === applicant.candidate_id ? "Unlocking..." : freeViewsLeft > 0 ? "Unlock full profile · Free" : "Unlock full profile · $2.99"}
                                    </button>
                                    {profile && <ReportButton targetType="profile" targetId={profile.id} label="Report profile" />}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                          {visibleApplicants.length === 0 && <p className="text-sm text-[var(--muted)] md:col-span-2">No applicants match that filter.</p>}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
