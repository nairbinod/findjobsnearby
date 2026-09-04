import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { categories as ALL_CATEGORIES } from "@/lib/jobs";
import { getAllJobs, getJobBySlug, jobHref } from "@/lib/jobs-data";
import { citySlug, categorySlug, parseCitySlug, TX_METROS } from "@/lib/geo";

const LEGACY_ID_RE = /^demo-|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type CityPageProps = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return TX_METROS.map((city) => ({ city: citySlug(city, "TX") }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city: citySegment } = await params;
  if (LEGACY_ID_RE.test(citySegment)) return {};
  const parsed = parseCitySlug(citySegment);
  if (!parsed) return {};
  return {
    title: `Jobs in ${parsed.city}, ${parsed.state} | FindJobsNearBy`,
    description: `Browse local job openings in ${parsed.city}, ${parsed.state} from nearby small businesses. Free to apply.`,
    alternates: { canonical: `/jobs/${citySegment}` },
  };
}

export default async function CityJobsPage({ params }: CityPageProps) {
  const { city: citySegment } = await params;

  // Backward-compatible redirect: old listing URLs were a single /jobs/{id}
  // segment. Send them to the canonical /jobs/{city}/{slug} URL.
  if (LEGACY_ID_RE.test(citySegment)) {
    const job = await getJobBySlug(citySegment);
    if (!job) notFound();
    permanentRedirect(jobHref(job));
  }

  const parsed = parseCitySlug(citySegment);
  if (!parsed) notFound();

  const jobs = (await getAllJobs()).filter((job) => citySlug(job.city, job.state) === citySegment);

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Jobs in ${parsed.city}, ${parsed.state}`,
    url: `https://findjobsnearby.com/jobs/${citySegment}`,
  };

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collection).replace(/</g, "\\u003c") }} />
      <header className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link>
        <Link href="/jobs" className="text-sm font-bold text-[var(--muted)]">All jobs <span aria-hidden="true">→</span></Link>
      </header>
      <main className="mx-auto max-w-[1240px] px-6 pb-20 lg:px-10">
        <div className="border-b border-[var(--line)] pb-12 pt-12">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Local jobs</p>
          <h1 className="display max-w-[700px] text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">Jobs in {parsed.city}, {parsed.state}</h1>
          <p className="mt-6 max-w-[520px] text-lg leading-7 text-[var(--muted)]">{jobs.length} open role{jobs.length === 1 ? "" : "s"} from small businesses in {parsed.city}.</p>
        </div>
        <section className="mt-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)]">Browse by category</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {ALL_CATEGORIES.filter((c) => c !== "All jobs").map((item) => (
              <Link key={item} href={`/jobs/${citySegment}/${categorySlug(item)}`} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]">
                {item}
              </Link>
            ))}
          </div>
        </section>
        <section className="mt-10 grid gap-4">
          {jobs.map((job) => (
            <Link href={jobHref(job)} key={job.id} className="grid gap-3 rounded-2xl border border-[var(--line)] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[var(--ink)] hover:shadow-lg sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                {job.urgent && <span className="mb-2 inline-block rounded-full bg-[var(--coral)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Urgently hiring</span>}
                <h3 className="text-xl font-bold">{job.title}</h3>
                <p className="mt-2 text-sm font-semibold text-[var(--muted)]">{job.company} · {job.category}</p>
              </div>
              <p className="display text-2xl font-bold">{job.pay}</p>
            </Link>
          ))}
          {jobs.length === 0 && <div className="rounded-2xl border border-dashed border-[var(--line)] p-12 text-center text-[var(--muted)]">No open roles in {parsed.city} yet. <Link href="/post" className="font-bold text-[var(--coral)]">Post one for free →</Link></div>}
        </section>
      </main>
    </div>
  );
}
