import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog";
import { breadcrumbSchema } from "@/lib/breadcrumb";
import NewsletterSignup from "@/components/NewsletterSignup";

const title = "Blog | FindJobsNearBy";
const description = "Practical, honest writing about local hiring and finding work nearby — for small business owners and job seekers alike.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: { type: "website", title, description, url: "/blog" },
  twitter: { card: "summary_large_image", title, description },
};

export default function BlogIndexPage() {
  const breadcrumb = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]);

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
      <header className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link>
        <Link href="/guides" className="text-sm font-bold text-[var(--muted)]">Guides <span aria-hidden="true">→</span></Link>
      </header>
      <main className="mx-auto max-w-[1000px] px-6 pb-20 pt-6 lg:px-10">
        <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">FindJobsNearBy blog</p>
        <h1 className="display max-w-[650px] text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">Local hiring, without the noise.</h1>
        <p className="mt-6 max-w-[560px] text-lg leading-7 text-[var(--muted)]">Honest writing for small business owners and job seekers — no fluff, no invented statistics.</p>
        <div className="mt-12 grid gap-4">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="grid gap-2 rounded-2xl border border-[var(--line)] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[var(--ink)] hover:shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              <h2 className="text-2xl font-bold">{post.title}</h2>
              <p className="text-sm leading-6 text-[var(--muted)]">{post.description}</p>
              <span className="mt-2 text-sm font-bold text-[var(--coral)]">Read the post →</span>
            </Link>
          ))}
        </div>
        <NewsletterSignup />
      </main>
    </div>
  );
}
