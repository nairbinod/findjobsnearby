import Link from "next/link";

export default function EmployerBanner() {
  return (
    <section className="mx-4 mt-8 overflow-hidden rounded-2xl border-2 border-[var(--ink)] bg-white px-6 py-5 sm:mx-10 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--coral)]">For local business owners</p>
        <p className="mt-2 text-lg font-bold text-[var(--ink)]">Post your job free. No fees. No frills. No long signup.</p>
      </div>
      <Link href="/employer-interest" className="mt-4 inline-block whitespace-nowrap rounded-full bg-[var(--coral)] px-5 py-3 text-center text-sm font-bold text-white sm:mt-0">Tell us what you&apos;re hiring for <span aria-hidden="true">→</span></Link>
    </section>
  );
}
