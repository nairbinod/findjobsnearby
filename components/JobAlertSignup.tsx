"use client";

import { FormEvent, useState } from "react";

const jobCategories = ["Food & hospitality", "Skilled trades", "Care & education", "Operations"] as const;

export default function JobAlertSignup() {
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("busy");
    setMessage("");
    try {
      const response = await fetch("/api/job-alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, category: category || undefined }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save your subscription.");
      setStatus("done");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save your subscription.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <section className="mx-4 mt-2 rounded-2xl border-2 border-[var(--ink)] bg-white px-6 py-6 text-center sm:mx-10 sm:px-8">
        <p className="font-bold">You&apos;re in. We&apos;ll email you when new jobs match.</p>
      </section>
    );
  }

  return (
    <section className="mx-4 mt-2 overflow-hidden rounded-2xl border-2 border-[var(--ink)] bg-white px-6 py-6 sm:mx-10 sm:px-8">
      <div className="sm:flex sm:items-center sm:justify-between sm:gap-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--coral)]">Not ready to browse yet?</p>
          <p className="mt-2 text-lg font-bold text-[var(--ink)]">Get an email when new jobs go up. No account needed.</p>
        </div>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row sm:shrink-0">
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-h-12 w-full rounded-full border border-[var(--line)] px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--coral)] sm:w-56" />
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-12 rounded-full border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--coral)]">
            <option value="">All categories</option>
            {jobCategories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button disabled={status === "busy"} className="min-h-12 whitespace-nowrap rounded-full bg-[var(--coral)] px-6 text-sm font-bold text-white disabled:opacity-60">{status === "busy" ? "Signing up..." : "Notify me"}</button>
        </form>
      </div>
      {message && <p role="status" className="mt-3 text-xs font-semibold text-[var(--coral)]">{message}</p>}
    </section>
  );
}
