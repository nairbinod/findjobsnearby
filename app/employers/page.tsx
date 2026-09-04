import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbSchema } from "@/lib/breadcrumb";

const title = "Hire Locally, Free to Post | FindJobsNearBy for Employers";
const description = "Post jobs free across Dallas-Fort Worth. Pay $2.99 only when you view a candidate's full profile and open messaging — no listing fees, ever.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/employers" },
  openGraph: { type: "website", title, description, url: "/employers" },
  twitter: { card: "summary_large_image", title, description },
};

const steps = [
  { n: "01", title: "Post for free", body: "Share the role, pay range, location, employment type, and 3-5 responsibilities. Posting is always free — never pay just to advertise a position." },
  { n: "02", title: "Review applicants for free", body: "Browse AI-curated candidate profiles as applications come in. You decide who's worth contacting before spending anything." },
  { n: "03", title: "Pay only to unlock", body: "$2.99 opens a candidate's full profile and in-app messaging — permanently, even if they apply to another of your jobs later." },
  { n: "04", title: "Grow when you're hiring often", body: "Growth ($39.99/mo) bundles 25 included views, advanced search, saved candidates, applicant management, and team seats for repeat hiring." },
];

const faqs = [
  { q: "Is posting really free?", a: "Yes. Posting a job costs $0, always. You only pay if you choose to unlock a specific candidate's full profile and messaging." },
  { q: "How does the $2.99 unlock work?", a: "You can review every applicant's free preview profile first. When you find someone worth contacting, a one-time $2.99 payment opens their full profile and messaging — permanently." },
  { q: "Can I post more than one open role?", a: "Yes. If you're hiring for multiple positions, post each one in the same session — each gets its own pay range, URL, and lifecycle." },
  { q: "What if I hire often?", a: "Growth ($39.99/mo) includes 25 profile views, advanced search, saved candidates, applicant management tools, and multiple recruiter seats." },
];

export default function EmployersPage() {
  const breadcrumb = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "For Employers", path: "/employers" }]);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <header className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link>
        <Link href="/post" className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white">Post a job <span aria-hidden="true">↗</span></Link>
      </header>
      <main className="mx-auto max-w-[1000px] px-6 pb-20 pt-12 lg:px-10">
        <section className="max-w-[720px]">
          <p className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">For local business owners</p>
          <h1 className="display text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">Hire locally.<br /><em className="font-normal text-[var(--coral)]">Pay only when it works.</em></h1>
          <p className="mt-7 max-w-[600px] text-lg leading-8 text-[var(--muted)]">No listing fees. No maze of forms. Post a role, review applicants for free, and pay $2.99 only when you find someone worth contacting.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/post" className="rounded-full bg-[var(--coral)] px-7 py-4 text-center font-bold text-white shadow-[0_8px_0_#ce5a4b]">Post a job for free <span aria-hidden="true">→</span></Link><Link href="/plans" className="rounded-full border-2 border-[var(--ink)] px-7 py-4 text-center font-bold text-[var(--ink)]">See pricing <span aria-hidden="true">→</span></Link></div>
        </section>

        <section className="mt-20 grid gap-5 sm:grid-cols-2">
          {steps.map((step) => (
            <div key={step.n} className="border-t-2 border-[var(--ink)] pt-5">
              <span className="display text-3xl font-bold text-[var(--coral)]">{step.n}</span>
              <h2 className="mt-4 text-xl font-bold">{step.title}</h2>
              <p className="mt-3 leading-7 text-[var(--muted)]">{step.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 rounded-[24px] bg-[var(--ink)] p-8 text-white sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--yellow)]">Common questions</p>
          <h2 className="display mt-3 text-3xl font-bold">Employer FAQ</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {faqs.map((item) => (
              <div key={item.q}>
                <h3 className="font-bold">{item.q}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{item.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-white/60">More questions? See the full <Link href="/faq" className="font-bold text-white underline">FAQ</Link> or read <Link href="/about" className="font-bold text-white underline">why we built FindJobsNearBy</Link>.</p>
        </section>

        <section className="mt-16 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="display text-3xl font-bold">Ready to post your first role?</h2>
            <p className="mt-2 text-[var(--muted)]">It takes a few minutes and it&apos;s free.</p>
          </div>
          <Link href="/post" className="whitespace-nowrap rounded-full bg-[var(--coral)] px-7 py-4 font-bold text-white">Post a job <span aria-hidden="true">→</span></Link>
        </section>
      </main>
    </div>
  );
}
