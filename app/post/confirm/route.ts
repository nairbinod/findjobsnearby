import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  // generateLink with type "magiclink" creates the auth user if one doesn't
  // already exist for this email and returns it either way -- same
  // find-or-create semantics as the regular sign-in flow, in one call.
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email, options: { data: { role: "employer" } } });
  if (linkError || !linkData.user) {
    return NextResponse.redirect(`${base}/post?confirmError=account`);
  }
  const userId = linkData.user.id;

  const { data: account } = await admin.from("accounts").select("id").eq("id", userId).maybeSingle();
  if (!account) {
    const { error: accountError } = await admin.from("accounts").insert({ id: userId, role: "employer" });
    if (accountError) {
      return NextResponse.redirect(`${base}/post?confirmError=account`);
    }
  }

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
  // magic-link flow) -- verifyOtp on the hashed_token this same generateLink
  // call already produced mints a session with no second visible redirect
  // through Supabase's own /verify endpoint. Confirmed live: for a brand-new
  // email, generateLink's own verification_type comes back "signup", not
  // "magiclink" -- verifyOtp rejects the token as "invalid or expired" if
  // called with the wrong one, so this must use whatever type it actually
  // returned rather than assuming "magiclink" unconditionally.
  const supabase = await createSupabaseServerClient();
  await supabase.auth.verifyOtp({ token_hash: linkData.properties.hashed_token, type: linkData.properties.verification_type as "magiclink" | "signup" });

  return NextResponse.redirect(`${base}/employer?posted=${job.id}`);
}
