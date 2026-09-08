import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findOrCreateAccount, signInWithLink } from "@/lib/auth-confirm";
import { notifyNewApplication } from "@/lib/notify";

const SITE_URL = "https://findjobsnearby.com";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const base = origin.startsWith("http://localhost") ? origin : SITE_URL;

  if (!token) {
    return NextResponse.redirect(`${base}/jobs?confirmError=missing`);
  }

  const admin = createSupabaseAdminClient();
  const { data: pending } = await admin
    .from("pending_candidate_submissions")
    .select("id, email, job_id, payload, confirmed_at")
    .eq("confirmation_token", token)
    .maybeSingle();

  if (!pending || pending.confirmed_at) {
    return NextResponse.redirect(`${base}/jobs?confirmError=invalid`);
  }

  const payload = pending.payload as Record<string, unknown>;
  const email = pending.email;

  // If an account already exists for this email (returning candidate, or
  // even a registered employer applying somewhere themselves), this attaches
  // the new profile and application to that same account rather than
  // creating a duplicate -- and never overwrites whatever role it already has.
  const found = await findOrCreateAccount(admin, email, "candidate");
  if (!found) {
    return NextResponse.redirect(`${base}/jobs?confirmError=account`);
  }
  const { userId, linkData } = found;

  const { data: profile, error: profileError } = await admin.from("candidate_profiles").insert({
    candidate_id: userId,
    role_title: payload.roleTitle,
    category: payload.category,
    availability: payload.availability,
    available_from: payload.availableFrom || null,
    available_until: payload.availableUntil || null,
    curated_content: payload.curatedContent,
    approved_at: payload.approved ? new Date().toISOString() : null,
  }).select("id").single();

  if (profileError || !profile) {
    return NextResponse.redirect(`${base}/jobs?confirmError=profile`);
  }

  const { error: privateProfileError } = await admin.from("candidate_profile_private").insert({
    profile_id: profile.id,
    candidate_id: userId,
    work_history: payload.workHistory,
    desired_pay: payload.desiredPay || null,
  });

  if (privateProfileError) {
    return NextResponse.redirect(`${base}/jobs?confirmError=profile`);
  }

  const hasRequirements = Boolean(payload.hasRequirements);
  const { data: application, error: applicationError } = await admin.from("applications").insert({
    job_id: pending.job_id,
    candidate_id: userId,
    profile_id: profile.id,
    ...(hasRequirements ? {
      requirement_matches: payload.requirementMatches ?? [],
      requirement_notes: payload.requirementNotes ?? null,
      requirements_attested_at: new Date().toISOString(),
    } : {}),
  }).select("id").single();

  if (applicationError || !application) {
    return NextResponse.redirect(`${base}/jobs?confirmError=application`);
  }

  await admin.from("pending_candidate_submissions").update({ confirmed_at: new Date().toISOString() }).eq("id", pending.id);

  try {
    await notifyNewApplication(application.id);
  } catch {
    // The application itself already succeeded -- a failed employer
    // notification shouldn't block the candidate from landing signed in.
  }

  await signInWithLink(linkData);

  return NextResponse.redirect(`${base}/account?applied=1`);
}
