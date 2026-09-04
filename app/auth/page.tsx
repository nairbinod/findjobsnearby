"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { recordReferral, REFERRAL_COOKIE } from "@/lib/referral";

function readCookie(name: string) {
  return document.cookie.split("; ").find((row) => row.startsWith(`${name}=`))?.split("=")[1];
}

export default function AuthPage() {
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get("error");
    if (authError) setTimeout(() => setMessage(`Sign-in link error: ${authError}`), 0);
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: account } = await supabase.from("accounts").select("id").eq("id", data.user.id).maybeSingle();
      if (!account) {
        await supabase.from("accounts").insert({ id: data.user.id, role: data.user.user_metadata.role ?? "candidate" });
        const referralCode = readCookie(REFERRAL_COOKIE);
        if (referralCode) await recordReferral(supabase, decodeURIComponent(referralCode), data.user.id);
      }
      setMessage("You are signed in. Your account is ready.");
    });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cooldownUntil = Number(window.localStorage.getItem("findjobsnearby-auth-cooldown") ?? 0);
    if (cooldownUntil > Date.now()) {
      const seconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
      setMessage(`Please wait ${seconds} seconds before requesting another link.`);
      return;
    }
    setBusy(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const result = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${role === "employer" ? "/employer" : "/account"}`, data: { role } },
    });

    if (result.error) {
      setMessage(result.error.message);
      setBusy(false);
      return;
    }

    setMessage("Check your email for a one-time sign-in link.");
    window.localStorage.setItem("findjobsnearby-auth-cooldown", String(Date.now() + 60_000));
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-6 lg:px-10"><a href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></a><a href="/jobs" className="text-sm font-bold text-[var(--muted)]">Browse jobs <span aria-hidden="true">→</span></a></header>
      <main className="mx-auto grid max-w-[1000px] gap-10 px-6 pb-20 pt-12 lg:grid-cols-[.9fr_1fr] lg:items-center lg:px-10"><div><p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Your local work profile</p><h1 className="display text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">Start where<br />you are.</h1><p className="mt-6 max-w-[430px] text-lg leading-7 text-[var(--muted)]">One simple account for finding work, posting roles, and building a profile that sounds like you.</p></div><form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"><div className="mb-8"><p className="text-sm font-bold">Sign in or create your account</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">We&apos;ll email you a secure, one-time sign-in link. No password to remember.</p></div><fieldset><legend className="mb-3 text-sm font-bold">I&apos;m here to...</legend><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setRole("candidate")} className={`rounded-xl border px-3 py-4 text-sm font-bold ${role === "candidate" ? "border-[var(--coral)] bg-[#fff0eb]" : "border-[var(--line)]"}`}>Find work</button><button type="button" onClick={() => setRole("employer")} className={`rounded-xl border px-3 py-4 text-sm font-bold ${role === "employer" ? "border-[var(--coral)] bg-[#fff0eb]" : "border-[var(--line)]"}`}>Hire locally</button></div></fieldset><label className="mt-6 block text-sm font-bold">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label><button disabled={busy} className="mt-8 w-full rounded-full bg-[var(--coral)] px-6 py-4 font-bold text-white disabled:opacity-60">{busy ? "Sending link..." : "Email me a sign-in link"} <span aria-hidden="true">→</span></button>{message && <p role="status" className="mt-4 rounded-xl bg-[var(--mint)] p-4 text-sm leading-6">{message}</p>}<p className="mt-5 text-center text-xs leading-5 text-[var(--muted)]">By continuing, you agree to keep listings and profiles honest and respectful.</p></form></main>
    </div>
  );
}
