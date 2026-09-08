"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { unwrapEmbed } from "@/lib/postgrest";

const SITE_URL = "https://findjobsnearby.com";

type JobRow = {
  id: string;
  title: string;
  company_name: string;
  city: string;
  state: string;
  status: "published" | "closed" | "expired";
  employer_id: string | null;
  created_at: string;
};

type ApplicationRow = {
  id: string;
  created_at: string;
  withdrawn_at: string | null;
  candidate_profiles: { role_title: string } | null;
};

const STATUS_FILTERS = ["all", "unclaimed", "published", "closed", "expired"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

/** US-72/73/74/75: admin job search plus the direct actions that follow from
 * finding a job -- disable it, (re)generate its claim link, or manage its
 * applications. All reads/writes here rely on the admin RLS policies added
 * alongside this component (is_admin() already covers jobs; applications
 * needed a new one) rather than a service-role API route, same as the
 * dashboard's existing flag/dispute actions. */
export default function AdminJobsPanel() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");
  const [claimLinks, setClaimLinks] = useState<Record<string, string>>({});
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [applicationsByJob, setApplicationsByJob] = useState<Record<string, ApplicationRow[]>>({});

  async function search() {
    setLoading(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    let query = supabase
      .from("jobs")
      .select("id, title, company_name, city, state, status, employer_id, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (statusFilter === "unclaimed") query = query.is("employer_id", null);
    else if (statusFilter !== "all") query = query.eq("status", statusFilter);

    // PostgREST's .or() filter syntax treats "," and "()" as structural --
    // strip them from free-text input rather than trying to escape them.
    const cleanedText = searchText.replace(/[,()]/g, "").trim();
    if (cleanedText) query = query.or(`title.ilike.%${cleanedText}%,company_name.ilike.%${cleanedText}%`);

    const { data, error } = await query;
    if (error) setMessage(error.message);
    setJobs((data as JobRow[]) ?? []);
    setSearched(true);
    setLoading(false);
  }

  async function disableJob(jobId: string) {
    if (!window.confirm("Disable this listing? It will stop showing in search/browse immediately.")) return;
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("jobs").update({ status: "closed" }).eq("id", jobId).select("id");
    if (error || !data || data.length === 0) { setMessage(error?.message ?? "Could not disable this listing."); return; }
    setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, status: "closed" } : job)));
  }

  async function generateClaimLink(jobId: string, alreadyClaimed: boolean) {
    if (alreadyClaimed && !window.confirm("This listing is already claimed. Generating a new claim link reverts it to Unclaimed and removes the current owner's access. Continue?")) return;
    const token = crypto.randomUUID();
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("jobs")
      .update({ employer_id: null, claimed_at: null, claim_token: token })
      .eq("id", jobId)
      .select("id")
      .maybeSingle();
    if (error || !data) { setMessage(error?.message ?? "Could not generate a claim link."); return; }
    setClaimLinks((current) => ({ ...current, [jobId]: `${SITE_URL}/claim/${token}` }));
    setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, employer_id: null } : job)));
  }

  async function toggleApplications(jobId: string) {
    if (expandedJobId === jobId) { setExpandedJobId(null); return; }
    setExpandedJobId(jobId);
    if (applicationsByJob[jobId]) return;
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("applications")
      .select("id, created_at, withdrawn_at, candidate_profiles(role_title)")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });
    if (error) { setMessage(error.message); return; }
    const rows = ((data ?? []) as unknown as Array<Omit<ApplicationRow, "candidate_profiles"> & { candidate_profiles: ApplicationRow["candidate_profiles"] | ApplicationRow["candidate_profiles"][] }>)
      .map((row) => ({ ...row, candidate_profiles: unwrapEmbed(row.candidate_profiles) }));
    setApplicationsByJob((current) => ({ ...current, [jobId]: rows }));
  }

  async function withdrawApplication(jobId: string, applicationId: string) {
    if (!window.confirm("Withdraw this application?")) return;
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("applications").update({ withdrawn_at: new Date().toISOString() }).eq("id", applicationId).select("id");
    if (error || !data || data.length === 0) { setMessage(error?.message ?? "Could not withdraw this application."); return; }
    setApplicationsByJob((current) => ({
      ...current,
      [jobId]: (current[jobId] ?? []).map((application) => (application.id === applicationId ? { ...application, withdrawn_at: new Date().toISOString() } : application)),
    }));
  }

  return (
    <section>
      <h2 className="text-xl font-bold">All jobs</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <input value={searchText} onChange={(event) => setSearchText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void search()} placeholder="Search title or company" className="min-w-[220px] flex-1 rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm outline-none focus:border-[var(--coral)]" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm outline-none">
          {STATUS_FILTERS.map((filter) => <option key={filter} value={filter}>{filter === "all" ? "All statuses" : filter[0].toUpperCase() + filter.slice(1)}</option>)}
        </select>
        <button onClick={() => void search()} disabled={loading} className="rounded-xl bg-[var(--ink)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{loading ? "Searching..." : "Search"}</button>
      </div>
      {message && <p className="mt-3 text-sm font-semibold text-[var(--coral)]">{message}</p>}
      {searched && jobs.length === 0 && !loading && <p className="mt-4 text-sm text-[var(--muted)]">No jobs match this search.</p>}
      {jobs.length > 0 && (
        <div className="mt-4 space-y-3">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-xl border border-[var(--line)] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{job.title}</p>
                    <span className="rounded-full bg-[var(--line)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--muted)]">{job.status}</span>
                    {job.employer_id === null && <span className="rounded-full bg-[var(--yellow)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--ink)]">Unclaimed</span>}
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{job.company_name} · {job.city}, {job.state} · Posted {new Date(job.created_at).toLocaleDateString()}</p>
                  {job.employer_id && <p className="mt-1 text-xs text-[var(--muted)]">Employer ID: <span className="select-all font-mono">{job.employer_id}</span></p>}
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-bold">
                  {job.status === "published" && <button onClick={() => void disableJob(job.id)} className="text-[var(--coral)]">Disable</button>}
                  <button onClick={() => void generateClaimLink(job.id, job.employer_id !== null)} className="text-[var(--ink)]">{job.employer_id === null ? "New claim link" : "Revert to unclaimed"}</button>
                  <button onClick={() => void toggleApplications(job.id)} className="text-[var(--muted)]">{expandedJobId === job.id ? "Hide applications" : "View applications"}</button>
                </div>
              </div>
              {claimLinks[job.id] && <div className="mt-3 rounded-lg bg-[var(--cream)] p-3 text-xs break-all">{claimLinks[job.id]}</div>}
              {expandedJobId === job.id && (
                <div className="mt-4 space-y-2 border-t border-[var(--line)] pt-4">
                  {(applicationsByJob[job.id] ?? []).length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">No applications yet.</p>
                  ) : (
                    applicationsByJob[job.id].map((application) => (
                      <div key={application.id} className={`flex items-center justify-between rounded-lg border border-[var(--line)] px-3 py-2 text-sm ${application.withdrawn_at ? "opacity-60" : ""}`}>
                        <span>{application.candidate_profiles?.role_title ?? "Candidate"} · Applied {new Date(application.created_at).toLocaleDateString()}</span>
                        {application.withdrawn_at ? <span className="text-xs font-bold uppercase text-[var(--muted)]">Withdrawn</span> : <button onClick={() => void withdrawApplication(job.id, application.id)} className="text-xs font-bold text-[var(--coral)]">Disable</button>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
