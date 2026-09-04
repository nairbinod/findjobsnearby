import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbSchema } from "@/lib/breadcrumb";

const title = "About FindJobsNearBy | Texas Local Job Marketplace";
const description = "FindJobsNearBy is a free job posting and job search platform for Dallas-Fort Worth small businesses and local job seekers. Learn why we built a marketplace that never charges to post or apply.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: { type: "website", title, description, url: "/about" },
  twitter: { card: "summary_large_image", title, description },
};

export default function AboutPage() {
  const breadcrumb = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }]);

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
      <header className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-6 lg:px-10"><Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link><Link href="/jobs" className="text-sm font-bold text-[var(--muted)]">Browse jobs <span aria-hidden="true">→</span></Link></header>
      <main className="mx-auto max-w-[1000px] px-6 pb-20 pt-12 lg:px-10">

        <section className="max-w-[760px]">
          <p className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Why FindJobsNearBy exists</p>
          <h1 className="display text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">Hiring locally<br /><em className="font-normal text-[var(--coral)]">shouldn&apos;t be this hard.</em></h1>
          <p className="mt-8 max-w-[680px] text-xl leading-8 text-[var(--muted)]">FindJobsNearBy started with a simple problem: finding good seasonal help should not cost a small business hundreds of dollars every year.</p>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <article className="rounded-2xl bg-white p-7 shadow-sm sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--coral)]">A note from the founder</p>
            <div className="mt-7 space-y-5 text-lg leading-8 text-[var(--ink)]/80">
              <p>I own a brick-and-mortar business, and every year I hire seasonal employees. Like many small businesses, I have used services like Indeed to find people for those roles.</p>
              <p>I can end up paying $500–$800, and still receive a lot of candidates who do not fit what I am looking for. Then the next year, I have to start over and pay again.</p>
              <p className="display text-2xl font-bold leading-snug text-[var(--ink)]">&ldquo;That recurring cost is not a good fit for a small business.&rdquo;</p>
              <p>So I started FindJobsNearBy to keep hiring simple and easy. It is built around the way local businesses actually hire: share what you need, reach people nearby, and spend less time sorting through applications that do not match.</p>
            </div>
            <p className="mt-8 border-t border-[var(--line)] pt-6 text-sm font-bold text-[var(--muted)]">Built from real small-business hiring experience in Texas.</p>
          </article>
          <aside className="rounded-2xl bg-[var(--mint)] p-7 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--coral)]">The idea</p>
            <h2 className="display mt-6 text-4xl font-bold leading-tight">Less noise.<br />More nearby.</h2>
            <p className="mt-5 leading-7 text-[var(--ink)]/70">A local job marketplace should respect everyone&apos;s time: the owner trying to fill a shift and the person looking for a fair opportunity close to home.</p>
          </aside>
        </section>

        <section className="mt-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">The math didn&apos;t work</p>
          <h2 className="display text-4xl font-bold tracking-[-.03em] sm:text-5xl">So we changed it.</h2>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--line)] bg-white p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">The old way</p>
              <p className="display mt-3 text-4xl font-bold text-[var(--muted)]">$500–800</p>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-[var(--muted)]">
                <li>· Paid whether or not anyone was a fit</li>
                <li>· Generic listings, generic applicants</li>
                <li>· Full price again next season</li>
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-[var(--ink)] bg-[var(--yellow)]/25 p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--coral)]">FindJobsNearBy</p>
              <p className="display mt-3 text-4xl font-bold">$0 to post</p>
              <ul className="mt-6 space-y-3 text-sm font-semibold leading-6 text-[var(--ink)]">
                <li>· Free to post, free to apply, always</li>
                <li>· AI organizes only what you actually said</li>
                <li>· $2.99 only when you want to contact someone</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-20"><p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">How it works</p><h2 className="display text-4xl font-bold tracking-[-.03em] sm:text-5xl">Simple by design.</h2><div className="mt-9 grid gap-5 md:grid-cols-2"><div className="border-t-2 border-[var(--ink)] pt-5"><span className="display text-3xl font-bold text-[var(--coral)]">01</span><h3 className="mt-5 text-xl font-bold">Businesses post for free</h3><p className="mt-3 leading-7 text-[var(--muted)]">Employers share the role, pay range, location, employment type, and a few responsibilities. An AI-assisted draft helps organize those details, but the employer reviews and approves everything before it goes live.</p></div><div className="border-t-2 border-[var(--ink)] pt-5"><span className="display text-3xl font-bold text-[var(--coral)]">02</span><h3 className="mt-5 text-xl font-bold">People find local work</h3><p className="mt-3 leading-7 text-[var(--muted)]">Job seekers browse roles by location, category, and pay. They can create a focused profile and apply for free, without writing a different application from scratch every time.</p></div><div className="border-t-2 border-[var(--ink)] pt-5"><span className="display text-3xl font-bold text-[var(--coral)]">03</span><h3 className="mt-5 text-xl font-bold">Profiles stay focused</h3><p className="mt-3 leading-7 text-[var(--muted)]">Candidates can create role-specific profiles from their own experience and availability. The goal is clarity, not inflated resumes or claims that were never provided.</p></div><div className="border-t-2 border-[var(--ink)] pt-5"><span className="display text-3xl font-bold text-[var(--coral)]">04</span><h3 className="mt-5 text-xl font-bold">Contact stays intentional</h3><p className="mt-3 leading-7 text-[var(--muted)]">Employers can review a free preview of applicants. A small paid unlock opens a candidate&apos;s full profile and messaging, so employers pay when they find someone worth contacting rather than just to post a listing.</p></div></div></section>

        <section className="mt-20 border-t border-[var(--line)] pt-12">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Where we&apos;re headed</p>
          <h2 className="display text-4xl font-bold tracking-[-.03em] sm:text-5xl">Starting local, on purpose.</h2>
          <p className="mt-5 max-w-[600px] leading-7 text-[var(--muted)]">We&apos;d rather be genuinely useful in one metro before spreading thin across the state.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-bold text-white inline-block">Now</p>
              <h3 className="mt-4 text-lg font-bold">Dallas–Fort Worth</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Our launch metro, where we&apos;re focused until the marketplace is genuinely liquid.</p>
            </div>
            <div>
              <p className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-bold text-[var(--muted)] inline-block">Next</p>
              <h3 className="mt-4 text-lg font-bold">Houston</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Our next metro, once DFW hiring activity proves the model out.</p>
            </div>
            <div>
              <p className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-bold text-[var(--muted)] inline-block">After that</p>
              <h3 className="mt-4 text-lg font-bold">Across Texas</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Metro by metro, at the pace real local hiring activity supports.</p>
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-[24px] bg-[var(--ink)] p-8 text-white sm:p-12"><h2 className="display max-w-[650px] text-4xl font-bold leading-tight sm:text-5xl">Good local work starts with a better first step.</h2><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/jobs" className="rounded-full bg-[var(--coral)] px-6 py-4 text-center font-bold">Find a job <span aria-hidden="true">→</span></Link><Link href="/post" className="rounded-full border border-white/40 px-6 py-4 text-center font-bold">Post for free <span aria-hidden="true">↗</span></Link></div><p className="mt-6 text-sm text-white/60">Hiring? See <Link href="/employers" className="font-bold text-white underline">how it works for employers</Link> or check the <Link href="/faq" className="font-bold text-white underline">FAQ</Link>.</p></section>
      </main>
    </div>
  );
}
