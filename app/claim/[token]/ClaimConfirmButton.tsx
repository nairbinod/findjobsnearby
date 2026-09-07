"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ClaimConfirmButton({ token, needsEmail }: { token: string; needsEmail: boolean }) {
  const [email, setEmail] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");

  async function confirmClaim() {
    if (needsEmail && !EMAIL_RE.test(email.trim())) {
      setMessage("Enter a valid email address to claim this listing.");
      return;
    }
    setClaiming(true);
    setMessage("");
    try {
      const response = await fetch("/api/claim/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email: needsEmail ? email.trim() : undefined }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not claim this listing.");
      // Full navigation, not client-side routing -- the session cookie this
      // request just set needs a real request to the dashboard to apply.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/employer?claimed=1";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not claim this listing.");
      setClaiming(false);
    }
  }

  return (
    <div className="mt-8">
      {needsEmail && (
        <label className="mb-4 block text-left text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          Your email
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@yourbusiness.com" className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-normal normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--coral)]" />
          <span className="mt-1 block text-xs font-normal normal-case tracking-normal text-[var(--muted)]">So we know where to send access to manage this listing.</span>
        </label>
      )}
      <button onClick={() => void confirmClaim()} disabled={claiming} className="w-full rounded-full bg-[var(--coral)] px-6 py-4 font-bold text-white shadow-[0_6px_0_#ce5a4b] disabled:opacity-60">
        {claiming ? "Claiming..." : "Yes, this is my posting"} <span aria-hidden="true">→</span>
      </button>
      {message && <p role="status" className="mt-4 text-sm text-[var(--coral)]">{message}</p>}
    </div>
  );
}
