import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides";
import { breadcrumbSchema } from "@/lib/breadcrumb";
import NewsletterSignup from "@/components/NewsletterSignup";

const title = "Guides | FindJobsNearBy";
const description = "Clear, structured how-to guides for hiring and job searching locally.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/guides" },
  openGraph: { type: "website", title, description, url: "/guides" },
  twitter: { card: "summary_large_image", title, description },
};

export default function GuidesIndexPage() {
  const breadcrumb = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }]);

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
      <header className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link>
        <Link href="/blog" className="text-sm font-bold text-[var(--muted)]">Blog <span aria-hidden="true">→</span></Link>
      </header>
      <main className="mx-auto max-w-[1000px] px-6 pb-20 pt-6 lg:px-10">
        <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Guides</p>
        <h1 className="display max-w-[650px] text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">The deeper reference.</h1>
        <p className="mt-6 max-w-[560px] text-lg leading-7 text-[var(--muted)]">Step-by-step walkthroughs, beyond what a short blog post covers.</p>
        <div className="mt-12 grid gap-4">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="grid gap-2 rounded-2xl border border-[var(--line)] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[var(--ink)] hover:shadow-lg">
              <h2 className="text-2xl font-bold">{guide.title}</h2>
              <p className="text-sm leading-6 text-[var(--muted)]">{guide.description}</p>
              <span className="mt-2 text-sm font-bold text-[var(--coral)]">Read the guide →</span>
            </Link>
          ))}
        </div>
        <NewsletterSignup />
      </main>
    </div>
  );
}
