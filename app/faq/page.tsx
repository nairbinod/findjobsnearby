import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbSchema } from "@/lib/breadcrumb";

const title = "Job Posting & Hiring FAQ | FindJobsNearBy";
const description = "Answers to common questions about posting jobs, applying, pricing, AI-assisted listings, and how FindJobsNearBy works for Texas small businesses and job seekers.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/faq" },
  openGraph: { type: "website", title, description, url: "/faq" },
  twitter: { card: "summary_large_image", title, description },
};

const faqs = [
  { q: "Is it free to post a job?", a: "Yes, posting is always free. There is no listing fee, ever." },
  { q: "Is it free to apply to jobs?", a: "Yes. Creating a profile and applying to jobs never costs a candidate anything." },
  { q: "How does the $2.99 profile unlock work?", a: "Employers can browse a free preview of every applicant's profile. When an employer finds someone worth contacting, a one-time $2.99 payment unlocks that candidate's full profile and in-app messaging. The unlock is permanent, even if the same candidate applies to another job from that employer later." },
  { q: "Are the job listings written by AI?", a: "Employers submit structured details (title, pay range, location, responsibilities), and an AI agent formats that into a clear listing. The AI only organizes what the employer actually stated — it does not invent facts — and the employer reviews and approves the listing before it goes live." },
  { q: "Can I have more than one candidate profile?", a: "Yes, up to five. This is useful for seasonal workers who take different roles at different times of year — each profile can be focused on a specific type of work." },
  { q: "What happens to my contact information?", a: "Phone numbers and email addresses are automatically blocked from listings, profiles, and applications so that contact only happens through the platform's paid unlock or messaging." },
  { q: "How do I report a listing or profile that looks wrong?", a: "Every listing and applicant profile has a report option. Our team reviews flagged content." },
  { q: "What is the Growth plan?", a: "Growth ($39.99/month) is for employers hiring regularly. It includes 25 profile-view unlocks, discounted overage views, advanced search, saved candidates, applicant management tools, multiple recruiter seats, two boosts per month, and hiring analytics." },
  { q: "Where does FindJobsNearBy operate?", a: "We launched in Dallas-Fort Worth and are expanding across Texas metro by metro, starting with Houston next." },
];

export default function FaqPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  const breadcrumb = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }]);

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
      <header className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link>
        <Link href="/jobs" className="text-sm font-bold text-[var(--muted)]">Browse jobs <span aria-hidden="true">→</span></Link>
      </header>
      <main className="mx-auto max-w-[900px] px-6 pb-20 pt-12 lg:px-10">
        <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Questions</p>
        <h1 className="display text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-6xl">Frequently asked.</h1>
        <div className="mt-12 divide-y divide-[var(--line)] border-t border-[var(--line)]">
          {faqs.map((item) => (
            <div key={item.q} className="py-6">
              <h2 className="text-lg font-bold">{item.q}</h2>
              <p className="mt-2 leading-7 text-[var(--muted)]">{item.a}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-[var(--muted)]">Still have questions? Read <Link href="/about" className="font-bold text-[var(--coral)]">why we built FindJobsNearBy</Link>, see <Link href="/employers" className="font-bold text-[var(--coral)]">how hiring works</Link>, or check <Link href="/plans" className="font-bold text-[var(--coral)]">pricing</Link>.</p>
      </main>
    </div>
  );
}
