import Link from "next/link";

type LegalSection = { heading: string; paragraphs: string[] };
type LegalPageProps = { eyebrow: string; title: string; intro: string; updated: string; sections: LegalSection[] };

export default function LegalPage({ eyebrow, title, intro, updated, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-6 lg:px-10"><Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link><Link href="/about" className="text-sm font-bold text-[var(--muted)]">About us <span aria-hidden="true">→</span></Link></header>
      <main className="mx-auto max-w-[820px] px-6 pb-20 pt-12 lg:px-10"><p className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">{eyebrow}</p><h1 className="display max-w-[760px] text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">{title}</h1><p className="mt-7 max-w-[700px] text-lg leading-8 text-[var(--muted)]">{intro}</p><p className="mt-5 text-xs font-semibold uppercase tracking-[.12em] text-[var(--muted)]">Last updated {updated}</p><article className="mt-12 rounded-2xl bg-white p-7 shadow-sm sm:p-10"><div className="space-y-10">{sections.map((section) => <section key={section.heading}><h2 className="display text-3xl font-bold">{section.heading}</h2><div className="mt-4 space-y-4 text-base leading-8 text-[var(--ink)]/75">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>)}</div></article><div className="mt-10 flex flex-wrap gap-5 text-sm font-bold text-[var(--coral)]"><Link href="/about">About</Link><Link href="/privacy">Privacy Policy</Link><Link href="/cookies">Cookie Policy</Link><Link href="/terms">Terms</Link><Link href="/refunds">Refunds &amp; disputes</Link></div></main>
    </div>
  );
}
