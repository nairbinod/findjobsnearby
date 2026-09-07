import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UNCLAIMED_PLACEHOLDER_ACCOUNT_ID } from "@/lib/unclaimed-listings";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : null;
  const submittedEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;

  if (!token) {
    return NextResponse.json({ error: "Missing claim token." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: job } = await admin
    .from("jobs")
    .select("id, seed_contact_email, claimed_at")
    .eq("claim_token", token)
    .maybeSingle();

  if (!job) {
    return NextResponse.json({ error: "This claim link is invalid." }, { status: 404 });
  }
  if (job.claimed_at) {
    return NextResponse.json({ error: "This listing has already been claimed." }, { status: 409 });
  }

  const email = job.seed_contact_email ?? submittedEmail;
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required to claim this listing." }, { status: 400 });
  }

  // Same find-or-create-and-sign-in pattern as US-70's confirm route.
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email, options: { data: { role: "employer" } } });
  if (linkError || !linkData.user) {
    return NextResponse.json({ error: "Could not set up your account. Try again in a moment." }, { status: 500 });
  }
  const userId = linkData.user.id;

  const { data: account } = await admin.from("accounts").select("id").eq("id", userId).maybeSingle();
  if (!account) {
    const { error: accountError } = await admin.from("accounts").insert({ id: userId, role: "employer" });
    if (accountError) {
      return NextResponse.json({ error: "Could not set up your account. Try again in a moment." }, { status: 500 });
    }
  }

  // US-66: this is the whole transfer -- once employer_id points at the real
  // account, every existing feature (edit, applicants, messaging, unlocks)
  // already keys off employer_id and needs no special-casing for a formerly-
  // unclaimed listing. US-68's "held applications" is automatic too: they
  // were already stored against this job's id and become visible the moment
  // this same query makes employer_id match the claimer's own account.
  const { data: updatedJob, error: updateError } = await admin
    .from("jobs")
    .update({ employer_id: userId, claimed_at: new Date().toISOString(), claim_token: null })
    .eq("id", job.id)
    .eq("employer_id", UNCLAIMED_PLACEHOLDER_ACCOUNT_ID)
    .is("claimed_at", null)
    .select("id")
    .maybeSingle();

  if (updateError || !updatedJob) {
    return NextResponse.json({ error: "This listing may have already been claimed." }, { status: 409 });
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.verifyOtp({ token_hash: linkData.properties.hashed_token, type: linkData.properties.verification_type as "magiclink" | "signup" });

  return NextResponse.json({ ok: true });
}
