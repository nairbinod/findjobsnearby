/* eslint-disable @next/next/no-html-link-for-pages */
import { notFound } from "next/navigation";
import { jobs } from "@/lib/jobs";

type JobPageProps = { params: Promise<{ id: string }> };

export default async function JobDetailPage({ params }: JobPageProps) {
  const { id } = await params;
  const job = jobs.find((item) => item.id === id);

  if (!job) notFound();

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-6 lg:px-10"><a href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></a><a href="/jobs" className="text-sm font-bold text-[var(--muted)]">All jobs <span aria-hidden="true">→</span></a></header>
      <main className="mx-auto max-w-[1000px] px-6 pb-20 pt-12 lg:px-10"><a href="/jobs" className="text-sm font-bold text-[var(--coral)]">← Back to jobs</a><div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]"><article><span className="rounded-full bg-[var(--mint)] px-3 py-1 text-[11px] font-bold uppercase">Open role</span><h1 className="display mt-6 text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">{job.title}</h1><p className="mt-5 text-lg font-semibold text-[var(--muted)]">{job.company} · {job.location}</p><div className="mt-10 flex flex-wrap gap-2 text-sm font-semibold"><span className="rounded bg-white px-3 py-2">{job.pay}</span><span className="rounded bg-white px-3 py-2">{job.type}</span><span className="rounded bg-white px-3 py-2">{job.category}</span></div><div className="mt-12 border-t border-[var(--line)] pt-8"><h2 className="display text-3xl font-bold">The role</h2><p className="mt-4 max-w-[650px] text-base leading-8 text-[var(--muted)]">{job.description}</p><p className="mt-5 max-w-[650px] text-base leading-8 text-[var(--muted)]">This is a local opportunity from a small business in the Dallas-Fort Worth area. Apply with a focused profile and hear directly from the employer.</p></div></article><aside className="h-fit rounded-2xl bg-[var(--ink)] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--yellow)]">Ready to apply?</p><h2 className="display mt-5 text-3xl font-bold">Keep it simple.</h2><p className="mt-3 text-sm leading-6 text-white/70">Create a role-specific profile and apply for free.</p><button className="mt-7 w-full rounded-full bg-[var(--coral)] px-5 py-4 font-bold">Apply for this job <span aria-hidden="true">→</span></button><p className="mt-4 text-center text-xs text-white/50">No application fees</p></aside></div></main>
    </div>
  );
}

export function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }));
}
