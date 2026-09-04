import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/jobs";
import { getAllJobs, jobHref } from "@/lib/jobs-data";
import { timeAgo } from "@/lib/time";
import EmployerBanner from "@/components/EmployerBanner";
import HomeJobsList from "@/components/HomeJobsList";
import JobAlertSignup from "@/components/JobAlertSignup";
import AuthNav from "@/components/AuthNav";

const title = "FindJobsNearBy | Local work, without the runaround";
const description = "Free to post and apply for local jobs across Dallas-Fort Worth, Texas. Small businesses post AI-assisted listings at no cost; job seekers apply for free.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", title, description, url: "/" },
  twitter: { card: "summary_large_image", title, description },
};

export default async function Home() {
  const allJobs = await getAllJobs();
  const jobs = allJobs.slice(0, 8);
  const jobHrefs = Object.fromEntries(jobs.map((job) => [job.id, jobHref(job)]));
  const featuredJob = allJobs[0];

  return (
    <div className="min-h-screen overflow-hidden bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 lg:px-10">
        <a href="#top" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></a>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[var(--muted)] md:flex"><a href="#jobs">Find work</a><a href="#how-it-works">How it works</a><Link href="/about">About</Link></nav>
        <div className="flex items-center gap-4 text-sm font-semibold"><AuthNav /><Link href="/post" className="rounded-full bg-[var(--ink)] px-5 py-3 text-white transition-transform hover:-translate-y-0.5">Post a job <span aria-hidden="true">↗</span></Link></div>
      </header>

      <main id="top">
        <EmployerBanner />
        <section className="noise mx-4 mt-2 overflow-hidden rounded-[28px] bg-[var(--mint)] px-6 py-14 sm:px-12 lg:mx-10 lg:px-20 lg:py-20"><div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]"><div className="rise max-w-[650px]"><p className="mb-6 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Local work. Human connection.</p><h1 className="display text-5xl font-bold leading-[.96] tracking-[-.045em] sm:text-7xl">Good work is<br /><em className="font-normal text-[var(--coral)]">closer</em> than you think.</h1><p className="mt-7 max-w-[480px] text-lg leading-7 text-[var(--ink)]/75">Find honest opportunities with small businesses in your neighborhood. No listing fees. No maze of forms. Just a better way to get to work.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><a href="#jobs" className="rounded-full bg-[var(--coral)] px-7 py-4 text-center font-bold text-white shadow-[0_8px_0_#ce5a4b] transition-transform hover:translate-y-0.5">Find a job <span aria-hidden="true">→</span></a><a href="#post" className="rounded-full border-2 border-[var(--ink)] px-7 py-4 text-center font-bold text-[var(--ink)] transition-colors hover:bg-white/40">I&apos;m hiring <span aria-hidden="true">↗</span></a></div></div><div className="rise-delay relative mx-auto w-full max-w-[430px] lg:ml-auto"><div className="absolute -right-3 -top-5 z-10 flex h-24 w-24 rotate-12 items-center justify-center rounded-full bg-[var(--yellow)] text-center text-xs font-bold leading-4 text-[var(--ink)] shadow-lg sm:-right-8 sm:-top-8">DFW<br />starts here</div>{featuredJob && <a href={jobHrefs[featuredJob.id] ?? jobHref(featuredJob)} className="relative block overflow-hidden rounded-[22px] border-8 border-white/70 bg-[#ef8b6e] p-5 shadow-2xl"><div className="mb-16 flex items-start justify-between text-white"><span className="text-xs font-bold uppercase tracking-[.18em]">Today&apos;s local find</span><span className="text-2xl">✳</span></div><div className="rounded-xl bg-[#fff8e9] p-5 text-[var(--ink)]"><div className="mb-5 flex items-center justify-between"><span className="rounded-full bg-[var(--mint)] px-3 py-1 text-[11px] font-bold">HIRING NOW</span><span className="text-xs text-[var(--muted)]">{timeAgo(featuredJob.postedAt)}</span></div><p className="display text-3xl font-bold">{featuredJob.title}</p><p className="mt-1 text-sm font-semibold">{featuredJob.company}</p><div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-4 text-xs font-semibold"><span>{featuredJob.city}, {featuredJob.state}</span><span>{featuredJob.pay}</span></div></div></a>}</div></div></section>

        <section className="mx-auto grid max-w-[1240px] gap-5 px-6 py-16 sm:grid-cols-3 lg:px-10" id="how-it-works"><div className="border-t-2 border-[var(--ink)] pt-4"><p className="display text-3xl font-bold">01 <span className="text-[var(--coral)]">→</span></p><h2 className="mt-5 text-lg font-bold">Search like a local</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Real jobs, in real neighborhoods, from people who are actually hiring.</p></div><div className="border-t-2 border-[var(--ink)] pt-4"><p className="display text-3xl font-bold">02 <span className="text-[var(--coral)]">→</span></p><h2 className="mt-5 text-lg font-bold">Apply in minutes</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Build a focused profile once. Use it for every role that feels right.</p></div><div className="border-t-2 border-[var(--ink)] pt-4"><p className="display text-3xl font-bold">03 <span className="text-[var(--coral)]">→</span></p><h2 className="mt-5 text-lg font-bold">Get a real response</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">We help local businesses and local people connect directly.</p></div></section>

        <section id="jobs" className="bg-white px-6 py-16 lg:px-10"><div className="mx-auto max-w-[1240px]"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Fresh in the neighborhood</p><h2 className="display text-4xl font-bold tracking-[-.03em] sm:text-5xl">Jobs worth getting up for.</h2></div><Link href="/jobs" className="text-sm font-bold underline decoration-[var(--coral)] decoration-2 underline-offset-4">View all jobs <span aria-hidden="true">→</span></Link></div><HomeJobsList jobs={jobs} categories={categories} jobHrefs={jobHrefs} /></div></section>

        <JobAlertSignup />

        <section id="post" className="mx-4 my-16 overflow-hidden rounded-[24px] bg-[var(--ink)] px-6 py-12 text-white sm:px-12 lg:mx-10 lg:px-20"><div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]"><div><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[var(--yellow)]">For the people doing the hiring</p><h2 className="display max-w-[650px] text-4xl font-bold leading-tight sm:text-5xl">Your next great hire might live five minutes away.</h2><p className="mt-5 max-w-[570px] leading-7 text-white/70">Post for free. Tell us what you need. Our AI helps you turn a few quick notes into a clear listing you can approve and share.</p></div><Link href="/post" className="rounded-full bg-[var(--yellow)] px-7 py-4 text-center font-bold text-[var(--ink)] transition-transform hover:-translate-y-0.5">Post a job for free <span aria-hidden="true">↗</span></Link></div></section>
      </main>
    </div>
  );
}
