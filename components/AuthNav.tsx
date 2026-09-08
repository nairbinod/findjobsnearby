"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthNavProps = { defaultAuthHref?: string };

export default function AuthNav({ defaultAuthHref = "/applicant/auth" }: AuthNavProps) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function loadAccount(userId: string, userEmail: string | undefined) {
      setEmail(userEmail ?? null);
      const { data } = await supabase.from("accounts").select("role").eq("id", userId).maybeSingle();
      setRole(data?.role ?? null);
      setLoaded(true);
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) void loadAccount(data.user.id, data.user.email);
      else setLoaded(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) void loadAccount(session.user.id, session.user.email);
      else { setEmail(null); setRole(null); }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!loaded) return null;

  if (!email) {
    return <Link href={defaultAuthHref} className="text-sm font-semibold text-[var(--muted)]">Sign in</Link>;
  }

  // "admin" falling through to the employer/candidate cases below would
  // send a founder/admin account to /account with no visible sign they're
  // signed in as admin at all -- this was reported live (US-30/§4.21).
  const dashboardHref = role === "admin" ? "/admin" : role === "employer" ? "/employer" : "/account";
  const dashboardLabel = role === "admin" ? "Admin dashboard" : role === "employer" ? "My jobs" : "My account";

  return (
    <div className="flex items-center gap-4 text-sm font-semibold">
      <span className="hidden text-[var(--muted)] md:inline" title={email}>{email}</span>
      <Link href={dashboardHref} className="text-[var(--ink)]">{dashboardLabel}</Link>
      <button onClick={() => void signOut()} className="text-[var(--muted)]">Sign out</button>
    </div>
  );
}
