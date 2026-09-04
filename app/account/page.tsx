"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import ReferralCard from "@/components/ReferralCard";
import AuthNav from "@/components/AuthNav";

type Application = {
  id: string;
  created_at: string;
  withdrawn_at: string | null;
  jobs: { title: string; company_name: string; employer_id: string } | null;
  candidate_profiles: { role_title: string } | null;
};

type Profile = { id: string; role_title: string; availability: string | null; available_from: string | null; available_until: string | null; approved_at: string | null };

function formatWindow(from: string | null, until: string | null) {
  if (!from && !until) return null;
  const fmt = (value: string) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (from && until) return `${fmt(from)} – ${fmt(until)}`;
  return from ? `From ${fmt(from)}` : `Through ${fmt(until!)}`;
}

export default function AccountPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewedByEmployerIds, setViewedByEmployerIds] = useState<Set<string>>(new Set());
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAccount() {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setMessage("Sign in to see your applications and profiles.");
        setLoading(false);
        return;
      }

      const [{ data: applicationData, error: applicationError }, { data: profileData, error: profileError }, { data: viewData }, { data: accountData }] = await Promise.all([
        supabase.from("applications").select("id, created_at, withdrawn_at, jobs(title, company_name, employer_id), candidate_profiles(role_title)").order("created_at", { ascending: false }),
        supabase.from("candidate_profiles").select("id, role_title, availability, available_from, available_until, approved_at").order("created_at", { ascending: false }),
        supabase.from("paid_profile_views").select("employer_id").eq("candidate_id", userData.user.id),
        supabase.from("accounts").select("referral_code").eq("id", userData.user.id).maybeSingle(),
      ]);
      if (applicationError || profileError) setMessage(applicationError?.message ?? profileError?.message ?? "We could not load your account.");
      const rawApplications = (applicationData ?? []) as unknown as Array<Application & { jobs: Application["jobs"][]; candidate_profiles: Application["candidate_profiles"][] }>;
      setApplications(rawApplications.map((application) => ({ ...application, jobs: application.jobs[0] ?? null, candidate_profiles: application.candidate_profiles[0] ?? null })));
      setViewedByEmployerIds(new Set((viewData ?? []).map((view) => view.employer_id)));
      setProfiles(profileData ?? []);
      setReferralCode(accountData?.referral_code ?? "");
      setLoading(false);
    }
    void loadAccount();
  }, []);

  async function withdrawApplication(applicationId: string) {
    if (!window.confirm("Withdraw this application? The employer will see it as withdrawn.")) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("applications").update({ withdrawn_at: new Date().toISOString() }).eq("id", applicationId);
    if (error) { setMessage(error.message); return; }
    setApplications((current) => current.map((application) => (application.id === applicationId ? { ...application, withdrawn_at: new Date().toISOString() } : application)));
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-6 lg:px-10"><a href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></a><div className="flex items-center gap-5"><AuthNav /><a href="/jobs" className="text-sm font-bold text-[var(--muted)]">Find more work <span aria-hidden="true">→</span></a></div></header>
      <main className="mx-auto max-w-[1100px] px-6 pb-20 pt-12 lg:px-10"><p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Your workspace</p><h1 className="display text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">Keep track<br />of your next move.</h1>{loading ? <p className="mt-12 text-[var(--muted)]">Loading your workspace...</p> : message ? <div className="mt-12 rounded-2xl border border-[var(--line)] bg-white p-8"><p className="text-lg font-semibold">{message}</p><a href="/auth" className="mt-5 inline-block rounded-full bg-[var(--coral)] px-6 py-3 text-sm font-bold text-white">Sign in <span aria-hidden="true">→</span></a></div> : <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_.9fr]"><section><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--coral)]">US-50 / US-51</p><h2 className="display mt-3 text-3xl font-bold">My applications</h2></div><span className="text-sm text-[var(--muted)]">{applications.length} total</span></div>{applications.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-[var(--line)] p-8 text-[var(--muted)]">Your applications will appear here after you apply to a role.</div> : <div className="mt-6 space-y-3">{applications.map((application) => <article key={application.id} className={`rounded-2xl border border-[var(--line)] bg-white p-5 ${application.withdrawn_at ? "opacity-60" : ""}`}><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold">{application.jobs?.title ?? "Job listing"}</h3><p className="mt-1 text-sm text-[var(--muted)]">{application.jobs?.company_name ?? "Local employer"}</p></div><span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${application.withdrawn_at ? "bg-[var(--line)] text-[var(--muted)]" : "bg-[var(--mint)]"}`}>{application.withdrawn_at ? "Withdrawn" : "Applied"}</span></div><div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]"><span>Applied {new Date(application.created_at).toLocaleDateString()}</span><span>Profile: {application.candidate_profiles?.role_title ?? "Focused profile"}</span><span>Employer view: {application.jobs && viewedByEmployerIds.has(application.jobs.employer_id) ? "Viewed" : "Not yet viewed"}</span>{!application.withdrawn_at && <button onClick={() => void withdrawApplication(application.id)} className="font-bold text-[var(--coral)]">Withdraw</button>}</div></article>)}</div>}</section><section><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--coral)]">US-11</p><h2 className="display mt-3 text-3xl font-bold">Your profiles</h2></div><span className="text-sm text-[var(--muted)]">{profiles.length}/5</span></div>{profiles.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-[var(--line)] p-8 text-[var(--muted)]">Create a profile when you apply for a role.</div> : <div className="mt-6 space-y-3">{profiles.map((profile) => <article key={profile.id} className="rounded-2xl border border-[var(--line)] bg-white p-5"><div className="flex items-center justify-between"><h3 className="font-bold">{profile.role_title}</h3><span className="text-xs font-semibold text-[var(--muted)]">{profile.approved_at ? "Approved" : "Draft"}</span></div><p className="mt-2 text-sm text-[var(--muted)]">Available: {profile.availability || "Not specified"}</p>{formatWindow(profile.available_from, profile.available_until) && <p className="mt-1 text-xs font-semibold text-[var(--coral)]">{formatWindow(profile.available_from, profile.available_until)}</p>}</article>)}</div>}</section></div>}{!loading && !message && referralCode && <div className="mt-12"><ReferralCard referralCode={referralCode} /></div>}</main>
    </div>
  );
}
