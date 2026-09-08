import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findOrCreateAccount, signInWithLink } from "@/lib/auth-confirm";

const SITE_URL = "https://findjobsnearby.com";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const base = origin.startsWith("http://localhost") ? origin : SITE_URL;

  if (!token) {
    return NextResponse.redirect(`${base}/post?confirmError=missing`);
  }

  const admin = createSupabaseAdminClient();
  const { data: pending } = await admin
    .from("pending_job_submissions")
    .select("id, email, payload, confirmed_at")
    .eq("confirmation_token", token)
    .maybeSingle();

  if (!pending || pending.confirmed_at) {
    return NextResponse.redirect(`${base}/post?confirmError=invalid`);
  }

  const payload = pending.payload as Record<string, unknown>;
  const email = pending.email;

  const found = await findOrCreateAccount(admin, email, "employer");
  if (!found) {
    return NextResponse.redirect(`${base}/post?confirmError=account`);
  }
  const { userId, linkData } = found;

  const { data: job, error: jobError } = await admin.from("jobs").insert({
    employer_id: userId,
    title: payload.title,
    company_name: payload.companyName,
    city: payload.city,
    state: payload.state,
    address: payload.address,
    urgent: payload.urgent,
    pay_range: payload.payRange,
    employment_type: payload.employmentType,
    category: payload.category,
    responsibilities: payload.responsibilities,
    requirements: Array.isArray(payload.requirements) && payload.requirements.length > 0 ? payload.requirements : null,
    description: payload.description,
    status: "published",
    ai_assisted: true,
    approved_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }).select("id").single();

  if (jobError || !job) {
    return NextResponse.redirect(`${base}/post?confirmError=job`);
  }

  await admin.from("pending_job_submissions").update({ confirmed_at: new Date().toISOString() }).eq("id", pending.id);

  // Sign the browser in as a real session (US-70's own AC: confirming both
  // publishes the listing and authenticates them, same as the existing
  // magic-link flow).
  await signInWithLink(linkData);

  return NextResponse.redirect(`${base}/employer?posted=${job.id}`);
}
