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
    // Job alerts (US-52) and the newsletter (US-49) are separate subscriber
    // lists with their own tokens -- try each rather than needing the link
    // itself to say which one it's for.
    const { data: jobAlert } = await admin
      .from("job_alert_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .select("id")
      .maybeSingle();
    if (jobAlert) {
      outcome = "unsubscribed";
    } else {
      const { data: newsletter } = await admin
        .from("newsletter_subscribers")
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq("unsubscribe_token", token)
        .select("id")
        .maybeSingle();
      outcome = newsletter ? "unsubscribed" : "not-found";
    }
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <main className="mx-auto max-w-[600px] px-6 py-24 text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Email preferences</p>
        {outcome === "unsubscribed" && (
          <>
            <h1 className="display text-4xl font-bold">You&apos;re unsubscribed.</h1>
            <p className="mt-4 text-[var(--muted)]">You won&apos;t get any more emails from this list.</p>
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
