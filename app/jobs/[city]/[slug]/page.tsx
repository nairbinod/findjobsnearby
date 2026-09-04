import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import ApplyForm from "@/components/ApplyForm";
import ReportButton from "@/components/ReportButton";
import { getAllJobs, getJobBySlug, jobHref } from "@/lib/jobs-data";
import { citySlug, parseCitySlug, parseCategorySlug } from "@/lib/geo";
import { buildJobPostingSchema } from "@/lib/job-schema";
import { timeAgo } from "@/lib/time";
import { recordJobView } from "@/lib/track-view";

type SlugPageProps = { params: Promise<{ city: string; slug: string }> };

const resolve = cache(async (citySegment: string, slug: string) => {
  const location = parseCitySlug(citySegment);
  const category = parseCategorySlug(slug);
  if (location && category) return { kind: "category" as const, location, category };

  const job = await getJobBySlug(slug);
  if (job) return { kind: "job" as const, job };

  return null;
});

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const resolved = await resolve(city, slug);
  if (!resolved) return {};

  if (resolved.kind === "category") {
    const { city: cityName, state } = resolved.location;
    return {
      title: `${resolved.category} Jobs in ${cityName}, ${state} | FindJobsNearBy`,
      description: `Open ${resolved.category.toLowerCase()} roles in ${cityName}, ${state} from local small businesses. Free to apply.`,
      alternates: { canonical: `/jobs/${city}/${slug}` },
    };
  }

  const { job } = resolved;
  const canonicalPath = jobHref(job);
  return {
    title: `${job.title} at ${job.company} | ${job.city}, ${job.state} | FindJobsNearBy`,
    description: job.description.slice(0, 155),
    alternates: { canonical: canonicalPath },
  };
}

export default async function JobOrCategoryPage({ params }: SlugPageProps) {
  const { city, slug } = await params;
  const resolved = await resolve(city, slug);
  if (!resolved) notFound();

  if (resolved.kind === "category") {
    const { city: cityName, state } = resolved.location;
    const { category } = resolved;
    const jobs = (await getAllJobs()).filter((job) => citySlug(job.city, job.state) === city && job.category === category);

    const collection = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${category} jobs in ${cityName}, ${state}`,
      url: `https://findjobsnearby.com/jobs/${city}/${slug}`,
    };

    return (
      <div className="min-h-screen bg-[var(--cream)]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collection).replace(/</g, "\\u003c") }} />
        <header className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 lg:px-10">
          <Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link>
          <Link href={`/jobs/${city}`} className="text-sm font-bold text-[var(--muted)]">All {cityName} jobs <span aria-hidden="true">→</span></Link>
        </header>
        <main className="mx-auto max-w-[1240px] px-6 pb-20 lg:px-10">
          <p className="pt-12 text-sm font-semibold text-[var(--muted)]"><Link href="/jobs" className="hover:text-[var(--ink)]">All jobs</Link> / <Link href={`/jobs/${city}`} className="hover:text-[var(--ink)]">{cityName}</Link> / {category}</p>
          <h1 className="display mt-4 max-w-[700px] text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-6xl">{category} jobs in {cityName}, {state}</h1>
          <p className="mt-6 max-w-[520px] text-lg leading-7 text-[var(--muted)]">{jobs.length} open role{jobs.length === 1 ? "" : "s"} right now.</p>
          <section className="mt-10 grid gap-4">
            {jobs.map((job) => (
              <Link href={jobHref(job)} key={job.id} className="grid gap-3 rounded-2xl border border-[var(--line)] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[var(--ink)] hover:shadow-lg sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  {job.urgent && <span className="mb-2 inline-block rounded-full bg-[var(--coral)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Urgently hiring</span>}
                  <h3 className="text-xl font-bold">{job.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-[var(--muted)]">{job.company} · {job.city}, {job.state} · Posted {timeAgo(job.postedAt)}</p>
                </div>
                <p className="display text-2xl font-bold">{job.pay}</p>
              </Link>
            ))}
            {jobs.length === 0 && <div className="rounded-2xl border border-dashed border-[var(--line)] p-12 text-center text-[var(--muted)]">No {category.toLowerCase()} roles in {cityName} yet. <Link href="/post" className="font-bold text-[var(--coral)]">Post one for free →</Link></div>}
          </section>
        </main>
      </div>
    );
  }

  const { job } = resolved;
  const canonicalCity = citySlug(job.city, job.state);
  if (canonicalCity !== city) permanentRedirect(jobHref(job));

  const isDemoJob = job.id.startsWith("demo-");
  if (!isDemoJob) await recordJobView(job.id);

  const canonicalUrl = `https://findjobsnearby.com${jobHref(job)}`;
  const jobPosting = buildJobPostingSchema(job, canonicalUrl);

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link>
        <Link href="/jobs" className="text-sm font-bold text-[var(--muted)]">All jobs <span aria-hidden="true">→</span></Link>
      </header>
      <main className="mx-auto max-w-[1000px] px-6 pb-20 pt-12 lg:px-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPosting).replace(/</g, "\\u003c") }} />
        <p className="text-sm font-semibold text-[var(--muted)]"><Link href="/jobs" className="hover:text-[var(--ink)]">All jobs</Link> / <Link href={`/jobs/${city}`} className="hover:text-[var(--ink)]">{job.city}, {job.state}</Link></p>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_300px]">
          <article>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${job.status === "closed" ? "bg-[var(--line)] text-[var(--muted)]" : "bg-[var(--mint)]"}`}>{job.status === "closed" ? "No longer accepting applications" : "Open role"}</span>
              {job.urgent && <span className="rounded-full bg-[var(--coral)] px-3 py-1 text-[11px] font-bold uppercase text-white">Urgently hiring</span>}
            </div>
            <h1 className="display mt-6 text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">{job.title}</h1>
            <p className="mt-5 text-lg font-semibold text-[var(--muted)]">{job.company} · {job.address ? `${job.address}, ` : ""}{job.city}, {job.state} · Posted {timeAgo(job.postedAt)}</p>
            <div className="mt-10 flex flex-wrap gap-2 text-sm font-semibold"><span className="rounded bg-white px-3 py-2">{job.pay}</span><span className="rounded bg-white px-3 py-2">{job.type}</span><span className="rounded bg-white px-3 py-2">{job.category}</span></div>
            <div className="mt-12 border-t border-[var(--line)] pt-8">
              <h2 className="display text-3xl font-bold">The role</h2>
              <p className="mt-4 max-w-[650px] text-base leading-8 text-[var(--muted)]">{job.description}</p>
              <p className="mt-5 max-w-[650px] text-base leading-8 text-[var(--muted)]">This is a local opportunity from a small business in {job.city}, {job.state}. Apply with a focused profile and hear directly from the employer.</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href={`/api/jobs/${job.id}/share-card`} className="text-xs font-semibold text-[var(--muted)] underline decoration-dotted underline-offset-4 hover:text-[var(--ink)]">Download shareable image ↓</a>
              {!isDemoJob && <ReportButton targetType="job" targetId={job.id} />}
            </div>
          </article>
          <aside className="h-fit rounded-2xl bg-[var(--ink)] p-6 text-white">
            {job.status === "closed" ? (
              <>
                <p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--yellow)]">This role is filled</p>
                <h2 className="display mt-5 text-3xl font-bold">Not accepting applications.</h2>
                <p className="mt-3 text-sm leading-6 text-white/70">This employer has closed this listing. Check out other open roles nearby.</p>
                <Link href="/jobs" className="mt-7 block w-full rounded-full bg-[var(--yellow)] px-5 py-4 text-center font-bold text-[var(--ink)]">Browse open jobs <span aria-hidden="true">→</span></Link>
              </>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--yellow)]">Ready to apply?</p>
                <h2 className="display mt-5 text-3xl font-bold">Keep it simple.</h2>
                <p className="mt-3 text-sm leading-6 text-white/70">Create a role-specific profile and apply for free.</p>
                <ApplyForm jobId={job.id} jobTitle={job.title} jobCategory={job.category} />
                <p className="mt-4 text-center text-xs text-white/50">No application fees</p>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
