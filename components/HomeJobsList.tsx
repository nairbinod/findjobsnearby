"use client";

import Link from "next/link";
import { useState } from "react";
import type { Job } from "@/lib/jobs";

export default function HomeJobsList({ jobs, categories, jobHrefs }: { jobs: Job[]; categories: string[]; jobHrefs: Record<string, string> }) {
  const [filter, setFilter] = useState("All jobs");
  const visibleJobs = filter === "All jobs" ? jobs : jobs.filter((job) => job.category === filter);

  return (
    <>
      <div className="mt-9 flex gap-2 overflow-x-auto pb-2">
        {categories.map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${filter === item ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"}`}>
            {item}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {visibleJobs.map((job, index) => (
          <Link href={jobHrefs[job.id]} key={job.id} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-[var(--line)] p-5 transition-all hover:-translate-y-1 hover:border-[var(--ink)] hover:shadow-lg">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${index % 4 === 0 ? "bg-[#ffe0d5]" : index % 4 === 1 ? "bg-[var(--mint)]" : index % 4 === 2 ? "bg-[var(--yellow)]" : "bg-[#dce9ed]"}`} aria-hidden="true">
              {index % 4 === 0 ? "✦" : index % 4 === 1 ? "⌁" : index % 4 === 2 ? "♡" : "▦"}
            </div>
            <div>
              {job.urgent && <span className="mb-1.5 inline-block rounded-full bg-[var(--coral)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Urgently hiring</span>}
              <h3 className="font-bold">{job.title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{job.company} · {job.city}, {job.state}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded bg-[var(--cream)] px-2 py-1">{job.type}</span><span className="rounded bg-[var(--cream)] px-2 py-1">{job.pay}</span></div>
            </div>
            <span className="self-start text-xs text-[var(--muted)]">View →</span>
          </Link>
        ))}
        {visibleJobs.length === 0 && <p className="text-sm text-[var(--muted)]">No roles in that category yet — check back soon.</p>}
      </div>
    </>
  );
}
