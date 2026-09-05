import Link from "next/link";
import type { ReactNode } from "react";
import type { ArticleSection } from "@/lib/blog";

type ArticleLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  publishedLabel: string;
  sections: ArticleSection[];
  backHref: string;
  backLabel: string;
  afterArticle?: ReactNode;
};

export default function ArticleLayout({ eyebrow, title, description, publishedLabel, sections, backHref, backLabel, afterArticle }: ArticleLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[820px] items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link>
        <Link href={backHref} className="text-sm font-bold text-[var(--muted)]">{backLabel} <span aria-hidden="true">→</span></Link>
      </header>
      <main className="mx-auto max-w-[820px] px-6 pb-20 pt-6 lg:px-10">
        <p className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">{eyebrow}</p>
        <h1 className="display max-w-[760px] text-4xl font-bold leading-[1.05] tracking-[-.03em] sm:text-6xl">{title}</h1>
        <p className="mt-6 max-w-[700px] text-lg leading-8 text-[var(--muted)]">{description}</p>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[.12em] text-[var(--muted)]">{publishedLabel}</p>
        <article className="mt-12 rounded-2xl bg-white p-7 shadow-sm sm:p-10">
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="display text-2xl font-bold sm:text-3xl">{section.heading}</h2>
                <div className="mt-4 space-y-4 text-base leading-8 text-[var(--ink)]/75">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            ))}
          </div>
        </article>
        {afterArticle}
      </main>
    </div>
  );
}
