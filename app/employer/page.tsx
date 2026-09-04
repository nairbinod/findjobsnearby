"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { buildJobHref } from "@/lib/geo";
import ReportButton from "@/components/ReportButton";

type EmployerJob = { id: string; title: string; company_name: string; city: string; state: string; pay_range: string; status: string; created_at: string; expires_at: string | null };
type Applicant = { id: string; created_at: string; candidate_profiles: { id: string; role_title: string; category: string | null; availability: string | null; available_from: string | null; available_until: string | null; curated_content: string | null }[] };

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

  async function showApplicants(jobId: string) {
    setSelectedJob(jobId);
    setCategoryFilter("All");
    setAvailabilityFilter("");
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("applications").select("id, created_at, candidate_profiles(id, role_title, category, availability, available_from, available_until, curated_content)").eq("job_id", jobId).order("created_at", { ascending: false });
    if (error) { setMessage(error.message); return; }
    const rows = (data as unknown as Applicant[]) ?? [];
    setApplicants(rows);
    setApplicationCounts((counts) => ({ ...counts, [jobId]: rows.length }));
  }

  useEffect(() => {
    async function loadJobs() {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { setMessage("Sign in with your employer account to manage jobs."); return; }
      const { data, error } = await supabase.from("jobs").select("id, title, company_name, city, state, pay_range, status, created_at, expires_at").eq("employer_id", userData.user.id).order("created_at", { ascending: false });
      if (error) { setMessage(error.message); return; }
      setJobs(data ?? []);
      setMessage(data?.length ? "" : "You have not posted a job yet.");

      const [viewCountEntries, applicationCountEntries] = await Promise.all([
        Promise.all((data ?? []).map(async (job) => {
          const { count } = await supabase.from("job_views").select("*", { count: "exact", head: true }).eq("job_id", job.id);
          return [job.id, count ?? 0] as const;
        })),
        Promise.all((data ?? []).map(async (job) => {
          const { count } = await supabase.from("applications").select("*", { count: "exact", head: true }).eq("job_id", job.id);
          return [job.id, count ?? 0] as const;
        })),
      ]);
      setViewCounts(Object.fromEntries(viewCountEntries));
      setApplicationCounts(Object.fromEntries(applicationCountEntries));
    }
    void loadJobs();
  }, []);

  const visibleApplicants = useMemo(() => applicants.filter((applicant) => {
    const profile = applicant.candidate_profiles?.[0];
    const matchesCategory = categoryFilter === "All" || profile?.category === categoryFilter;
    const matchesAvailability = !availabilityFilter || (profile?.availability ?? "").toLowerCase().includes(availabilityFilter.toLowerCase());
    return matchesCategory && matchesAvailability;
  }), [applicants, categoryFilter, availabilityFilter]);

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-6 lg:px-10"><a href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></a><a href="/post" className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white">Post a job <span aria-hidden="true">↗</span></a></header>
      <main className="mx-auto max-w-[1100px] px-6 pb-20 pt-12 lg:px-10">
        <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Employer workspace</p>
        <h1 className="display text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">Your local<br />hiring board.</h1>
        {message && !jobs.length ? (
          <div className="mt-12 rounded-2xl border border-[var(--line)] bg-white p-8"><p className="text-lg font-semibold">{message}</p><a href="/auth" className="mt-5 inline-block rounded-full bg-[var(--coral)] px-6 py-3 text-sm font-bold text-white">Sign in <span aria-hidden="true">→</span></a></div>
        ) : (
          <section className="mt-12">
            <div className="flex items-end justify-between"><h2 className="display text-3xl font-bold">Your listings</h2><span className="text-sm text-[var(--muted)]">{jobs.length} total</span></div>
            <div className="mt-6 space-y-3">
              {jobs.map((job) => (
                <article key={job.id} className="rounded-2xl border border-[var(--line)] bg-white p-5">
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <h3 className="text-xl font-bold">{job.title}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">{job.company_name} · {job.city} · {job.pay_range}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3"><span className="text-xs font-semibold uppercase tracking-wider text-[var(--coral)]">{job.status}</span><span className="text-xs text-[var(--muted)]">{viewCounts[job.id] ?? 0} unique view{(viewCounts[job.id] ?? 0) === 1 ? "" : "s"}</span><span className="text-xs text-[var(--muted)]">· {applicationCounts[job.id] ?? 0} applicant{(applicationCounts[job.id] ?? 0) === 1 ? "" : "s"}</span></div>
                    </div>
                    <div className="flex gap-4"><button onClick={() => void showApplicants(job.id)} className="text-sm font-bold text-[var(--ink)]">Applicants →</button><a href={buildJobHref(job.id, job.title, job.city, job.state)} className="text-sm font-bold text-[var(--coral)]">View listing →</a><a href={`/api/jobs/${job.id}/share-card`} className="text-sm font-bold text-[var(--muted)]">Download image ↓</a></div>
                  </div>
                  {selectedJob === job.id && (
                    <div className="mt-5 border-t border-[var(--line)] pt-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="font-bold">Applicants</h4>
                        <span className="text-xs text-[var(--muted)]">{applicants.length}/30 applications</span>
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
                            const profile = applicant.candidate_profiles?.[0];
                            return (
                              <div key={applicant.id} className="rounded-xl bg-[var(--cream)] p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-bold">{profile?.role_title ?? "Focused profile"}</p>
                                    <p className="mt-1 text-sm text-[var(--muted)]">Available: {profile?.availability ?? "Not specified"}{profile?.category ? ` · ${profile.category}` : ""}</p>
                                    {profile && formatWindow(profile.available_from, profile.available_until) && <p className="mt-1 text-xs font-semibold text-[var(--coral)]">{formatWindow(profile.available_from, profile.available_until)}</p>}
                                  </div>
                                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase">Preview</span>
                                </div>
                                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{profile?.curated_content ?? "Candidate profile pending approval."}</p>
                                <p className="mt-3 text-xs text-[var(--muted)]">Applied {new Date(applicant.created_at).toLocaleDateString()}</p>
                                <div className="mt-4 flex items-center justify-between gap-3">
                                  <button className="text-xs font-bold text-[var(--coral)]">Unlock full profile · $2.99</button>
                                  {profile && <ReportButton targetType="profile" targetId={profile.id} label="Report profile" />}
                                </div>
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
