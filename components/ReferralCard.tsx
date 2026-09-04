"use client";

import { useState } from "react";

export default function ReferralCard({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const link = `https://findjobsnearby.com/?ref=${referralCode}`;

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--coral)]">US-34</p>
      <h2 className="display mt-3 text-3xl font-bold">Know a business that&apos;s hiring?</h2>
      <p className="mt-3 max-w-[520px] text-sm leading-6 text-[var(--muted)]">Share your link. When a business you refer posts a job, we&apos;ll know it came from you.</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input readOnly value={link} className="w-full min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-sm font-semibold text-[var(--ink)] outline-none" />
        <button onClick={() => void copy()} className="rounded-xl bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white">{copied ? "Copied!" : "Copy link"}</button>
      </div>
    </section>
  );
}
