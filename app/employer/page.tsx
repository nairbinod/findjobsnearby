"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type EmployerJob = { id: string; title: string; company_name: string; city: string; pay_range: string; status: string; created_at: string };

export default function EmployerPage() {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [message, setMessage] = useState("Loading your jobs...");

  useEffect(() => {
    async function loadJobs() {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setMessage("Sign in with your employer account to manage jobs.");
        return;
      }
      const { data, error } = await supabase.from("jobs").select("id, title, company_name, city, pay_range, status, created_at").eq("employer_id", userData.user.id).order("created_at", { ascending: false });
      if (error) setMessage(error.message);
      else {
        setJobs(data ?? []);
        setMessage(data?.length ? "" : "You have not posted a job yet.");
      }
    }
    void loadJobs();
  }, []);

  return <div className="min-h-screen bg-[var(--cream)]"><header className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-6 lg:px-10"><a href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></a><a href="/post" className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white">Post a job <span aria-hidden="true">↗</span></a></header><main className="mx-auto max-w-[1100px] px-6 pb-20 pt-12 lg:px-10"><p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Employer workspace</p><h1 className="display text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">Your local<br />hiring board.</h1>{message && !jobs.length ? <div className="mt-12 rounded-2xl border border-[var(--line)] bg-white p-8"><p className="text-lg font-semibold">{message}</p><a href="/auth" className="mt-5 inline-block rounded-full bg-[var(--coral)] px-6 py-3 text-sm font-bold text-white">Sign in <span aria-hidden="true">→</span></a></div> : <section className="mt-12"><div className="flex items-end justify-between"><h2 className="display text-3xl font-bold">Your listings</h2><span className="text-sm text-[var(--muted)]">{jobs.length} total</span></div><div className="mt-6 space-y-3">{jobs.map((job) => <article key={job.id} className="grid gap-4 rounded-2xl border border-[var(--line)] bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><h3 className="text-xl font-bold">{job.title}</h3><p className="mt-1 text-sm text-[var(--muted)]">{job.company_name} · {job.city} · {job.pay_range}</p><p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[var(--coral)]">{job.status}</p></div><a href={`/jobs/${job.id}`} className="text-sm font-bold text-[var(--coral)]">View listing →</a></article>)}</div></section>}</main></div>;
}
