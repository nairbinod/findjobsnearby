import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/jobs";
import { getAllJobs, jobHref } from "@/lib/jobs-data";
import { TX_METROS } from "@/lib/geo";
import { timeAgo } from "@/lib/time";

export const metadata: Metadata = {
  title: "Browse Local Jobs in Dallas-Fort Worth | FindJobsNearBy",
  description: "Search open roles from small businesses across Dallas-Fort Worth. Filter by category, location, and pay. Free to apply.",
  alternates: { canonical: "/jobs" },
};

type JobsPageProps = { searchParams: Promise<{ category?: string; q?: string; location?: string }> };

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const category = params.category && categories.includes(params.category) ? params.category : "All jobs";
  const query = params.q ?? "";
  const location = params.location && params.location.length > 0 ? params.location : "Dallas-Fort Worth";

  const allJobs = await getAllJobs();
  const visibleJobs = allJobs.filter((job) => {
    const matchesCategory = category === "All jobs" || job.category === category;
    const searchText = `${job.title} ${job.company} ${job.city} ${job.state}`.toLowerCase();
    return matchesCategory && searchText.includes(query.toLowerCase());
  });

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: visibleJobs.map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://findjobsnearby.com${jobHref(job)}`,
      name: job.title,
    })),
  };

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, "\\u003c") }} />
      <header className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link>
        <Link href="/post" className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white">Post a job <span aria-hidden="true">↗</span></Link>
      </header>
      <main className="mx-auto max-w-[1240px] px-6 pb-20 lg:px-10">
        <div className="border-b border-[var(--line)] pb-12 pt-12"><p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">The local job board</p><h1 className="display max-w-[700px] text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">Find your next<br /><em className="font-normal text-[var(--coral)]">nearby.</em></h1><p className="mt-6 max-w-[520px] text-lg leading-7 text-[var(--muted)]">Fresh opportunities from small businesses across Dallas-Fort Worth.</p></div>
        <form action="/jobs" method="get" className="mt-10 grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[1.3fr_1fr_auto] sm:p-3">
          <input type="hidden" name="category" value={category} />
          <label className="flex flex-col gap-1 rounded-xl border border-[var(--line)] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">What are you looking for?<input name="q" defaultValue={query} placeholder="Job title or keyword" className="mt-1 bg-transparent text-base font-semibold normal-case tracking-normal text-[var(--ink)] outline-none placeholder:text-[var(--muted)]/60" /></label>
          <label className="flex flex-col gap-1 rounded-xl border border-[var(--line)] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Where?<select name="location" defaultValue={location} className="mt-1 bg-transparent text-base font-semibold normal-case tracking-normal text-[var(--ink)] outline-none"><option>Dallas-Fort Worth</option>{TX_METROS.map((city) => <option key={city}>{city}, TX</option>)}</select></label>
          <button type="submit" className="rounded-xl bg-[var(--coral)] px-7 py-4 font-bold text-white sm:self-stretch">Search <span aria-hidden="true">→</span></button>
        </form>
        <section className="mt-12">
          <div className="flex items-center justify-between gap-4"><h2 className="display text-3xl font-bold">{visibleJobs.length} jobs near {location}</h2><span className="hidden text-sm text-[var(--muted)] sm:block">Updated today</span></div>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {categories.map((item) => (
              <Link
                key={item}
                href={{ pathname: "/jobs", query: { ...(item !== "All jobs" ? { category: item } : {}), ...(query ? { q: query } : {}) } }}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${category === item ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--ink)]"}`}
              >
                {item}
              </Link>
            ))}
          </div>
          <div className="mt-5 grid gap-4">
            {visibleJobs.map((job) => (
              <Link href={jobHref(job)} key={job.id} className="grid gap-5 rounded-2xl border border-[var(--line)] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[var(--ink)] hover:shadow-lg sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3"><h3 className="text-xl font-bold">{job.title}</h3><span className="rounded-full bg-[var(--mint)] px-3 py-1 text-[11px] font-bold uppercase">Open</span></div>
                  <p className="mt-2 text-sm font-semibold text-[var(--muted)]">{job.company} · {job.city}, {job.state}</p>
                  <p className="mt-4 max-w-[650px] text-sm leading-6 text-[var(--muted)]">{job.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded bg-[var(--cream)] px-2 py-1">{job.type}</span><span className="rounded bg-[var(--cream)] px-2 py-1">{job.pay}</span><span className="rounded bg-[var(--cream)] px-2 py-1">{job.category}</span></div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="display text-2xl font-bold">{job.pay}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">Posted {timeAgo(job.postedAt)}</p>
                  <span className="mt-5 inline-block text-sm font-bold text-[var(--coral)]">View role →</span>
                </div>
              </Link>
            ))}
          </div>
          {visibleJobs.length === 0 && <div className="rounded-2xl border border-dashed border-[var(--line)] p-12 text-center text-[var(--muted)]">No roles match that search yet. Try another keyword.</div>}
        </section>
      </main>
    </div>
  );
}
