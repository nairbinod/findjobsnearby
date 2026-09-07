import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import ClaimConfirmButton from "./ClaimConfirmButton";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type ClaimPageProps = { params: Promise<{ token: string }> };

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { token } = await params;
  const admin = createSupabaseAdminClient();
  const { data: job } = await admin
    .from("jobs")
    .select("id, title, company_name, city, state, pay_range, claimed_at, seed_contact_email")
    .eq("claim_token", token)
    .maybeSingle();

  if (!job) notFound();

  if (job.claimed_at) {
    return (
      <div className="min-h-screen bg-[var(--cream)]">
        <main className="mx-auto max-w-[600px] px-6 py-24 text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Already claimed</p>
          <h1 className="display text-4xl font-bold">This listing has already been claimed.</h1>
          <p className="mt-4 text-[var(--muted)]">If that wasn&apos;t you, reply to the email you received or contact support@findjobsnearby.com.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <main className="mx-auto max-w-[600px] px-6 py-24 text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Claim your listing</p>
        <h1 className="display text-4xl font-bold leading-[1.05]">Is this your job posting?</h1>
        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6 text-left">
          <h2 className="text-xl font-bold">{job.title}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{job.company_name} · {job.city}, {job.state} · {job.pay_range}</p>
        </div>
        <p className="mt-6 text-sm leading-6 text-[var(--muted)]">Claiming takes one click — no signup form, no password. You&apos;ll be able to edit it, see applicants, and message candidates right away.</p>
        <ClaimConfirmButton token={token} needsEmail={!job.seed_contact_email} />
        <p className="mt-6 text-xs text-[var(--muted)]">Not your business? You can safely ignore this page — nothing changes unless you confirm.</p>
      </main>
    </div>
  );
}
