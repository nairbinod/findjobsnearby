import Link from "next/link";

export const metadata = {
  title: "Plans & Pricing | FindJobsNearBy",
  description: "Simple hiring plans for Texas small businesses and local job seekers.",
};

const freeFeatures = [
  "Post jobs at no cost",
  "Apply to jobs at no cost",
  "Browse local applicants",
  "Basic job-view count",
  "Role-specific candidate profiles",
];

const growthFeatures = [
  "25 profile views included each month",
  "Discounted overage profile views",
  "Advanced candidate search",
  "Saved candidates and messaging",
  "Applicant management tools",
  "Multiple recruiter seats",
  "2 boosts per month",
  "Hiring analytics and trends",
];

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-6 lg:px-10"><Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link><Link href="/about" className="text-sm font-bold text-[var(--muted)]">About us <span aria-hidden="true">→</span></Link></header>
  <main className="mx-auto max-w-[1100px] px-6 pb-20 pt-12 lg:px-10"><section className="max-w-[720px]"><p className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Simple pricing for local hiring</p><h1 className="display text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">Start free.<br /><em className="font-normal text-[var(--coral)]">Grow when you hire more.</em></h1><p className="mt-7 max-w-[650px] text-lg leading-8 text-[var(--muted)]">Post a job and apply for free. When your hiring gets busy, Growth gives repeat-hiring businesses more views and more ways to organize their search.</p></section><section className="mt-14 grid gap-6 lg:grid-cols-2"><article className="rounded-2xl border-2 border-[var(--ink)] bg-white p-7 sm:p-9"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--coral)]">For everyone</p><h2 className="display mt-4 text-4xl font-bold">Free</h2></div><span className="rounded-full bg-[var(--mint)] px-3 py-1 text-xs font-bold uppercase">Always free</span></div><p className="mt-5 text-sm leading-6 text-[var(--muted)]">The simple way to get started with local work.</p><div className="mt-7 flex items-baseline gap-2"><span className="display text-5xl font-bold">$0</span><span className="text-sm text-[var(--muted)]">forever</span></div><ul className="mt-8 space-y-4 border-t border-[var(--line)] pt-7">{freeFeatures.map((feature) => <li key={feature} className="flex gap-3 text-sm font-semibold"><span className="text-[var(--coral)]">✓</span>{feature}</li>)}</ul><Link href="/jobs" className="mt-9 block rounded-full border-2 border-[var(--ink)] px-6 py-4 text-center text-sm font-bold">Find local work <span aria-hidden="true">→</span></Link></article><article className="relative overflow-hidden rounded-2xl bg-[var(--ink)] p-7 text-white sm:p-9"><span className="absolute right-6 top-6 rotate-6 rounded-full bg-[var(--yellow)] px-3 py-2 text-xs font-bold uppercase text-[var(--ink)]">For growing teams</span><p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--yellow)]">Repeat hiring</p><h2 className="display mt-4 text-4xl font-bold">Growth</h2><p className="mt-5 max-w-[390px] text-sm leading-6 text-white/70">More included views and team tools for businesses hiring regularly.</p><div className="mt-7 flex items-baseline gap-2"><span className="display text-5xl font-bold">$39.99</span><span className="text-sm text-white/60">/ month</span></div><ul className="mt-8 space-y-4 border-t border-white/15 pt-7">{growthFeatures.map((feature) => <li key={feature} className="flex gap-3 text-sm font-semibold"><span className="text-[var(--yellow)]">✓</span>{feature}</li>)}</ul><Link href="/post" className="mt-9 block rounded-full bg-[var(--yellow)] px-6 py-4 text-center text-sm font-bold text-[var(--ink)]">Start hiring <span aria-hidden="true">↗</span></Link><p className="mt-4 text-center text-xs text-white/50">Growth billing is coming soon.</p></article></section><section className="mt-14 border-t border-[var(--line)] pt-8"><h2 className="display text-3xl font-bold">How contact views work</h2><div className="mt-5 grid gap-6 text-sm leading-7 text-[var(--muted)] sm:grid-cols-3"><p><strong className="text-[var(--ink)]">Free preview.</strong> Review the information a candidate submitted before deciding who to contact.</p><p><strong className="text-[var(--ink)]">Pay when interested.</strong> A future $2.99 unlock opens the full submitted profile and messaging.</p><p><strong className="text-[var(--ink)]">Built for small business.</strong> Posting and applying never require a paid plan.</p></div></section></main>
    </div>
  );
}
