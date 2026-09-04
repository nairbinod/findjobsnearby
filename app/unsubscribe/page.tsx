import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type UnsubscribePageProps = { searchParams: Promise<{ token?: string }> };

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { token } = await searchParams;
  let outcome: "unsubscribed" | "not-found" | "missing" = "missing";

  if (token) {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("job_alert_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .select("id")
      .maybeSingle();
    outcome = data ? "unsubscribed" : "not-found";
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <main className="mx-auto max-w-[600px] px-6 py-24 text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Job alerts</p>
        {outcome === "unsubscribed" && (
          <>
            <h1 className="display text-4xl font-bold">You&apos;re unsubscribed.</h1>
            <p className="mt-4 text-[var(--muted)]">You won&apos;t get any more job alert emails from FindJobsNearBy.</p>
          </>
        )}
        {outcome === "not-found" && (
          <>
            <h1 className="display text-4xl font-bold">Link not found.</h1>
            <p className="mt-4 text-[var(--muted)]">This unsubscribe link isn&apos;t valid, or you&apos;ve already unsubscribed.</p>
          </>
        )}
        {outcome === "missing" && (
          <>
            <h1 className="display text-4xl font-bold">Missing link.</h1>
            <p className="mt-4 text-[var(--muted)]">Use the unsubscribe link from one of our emails.</p>
          </>
        )}
        <Link href="/" className="mt-8 inline-block rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-bold text-white">Back to FindJobsNearBy <span aria-hidden="true">→</span></Link>
      </main>
    </div>
  );
}
