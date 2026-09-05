"use client";

import { FormEvent, useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("busy");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
      <section className="mt-10 rounded-2xl border-2 border-[var(--ink)] bg-white px-6 py-6 text-center sm:px-8">
        <p className="font-bold">You&apos;re subscribed. We&apos;ll email you when there&apos;s something new.</p>
      </section>
    );
  }

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border-2 border-[var(--ink)] bg-white px-6 py-6 sm:px-8">
      <div className="sm:flex sm:items-center sm:justify-between sm:gap-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--coral)]">Newsletter</p>
          <p className="mt-2 text-lg font-bold text-[var(--ink)]">Get new posts and guides by email.</p>
        </div>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row sm:shrink-0">
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-h-12 w-full rounded-full border border-[var(--line)] px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--coral)] sm:w-64" />
          <button disabled={status === "busy"} className="min-h-12 whitespace-nowrap rounded-full bg-[var(--coral)] px-6 text-sm font-bold text-white disabled:opacity-60">{status === "busy" ? "Subscribing..." : "Subscribe"}</button>
        </form>
      </div>
      {message && <p role="status" className="mt-3 text-xs font-semibold text-[var(--coral)]">{message}</p>}
    </section>
  );
}
