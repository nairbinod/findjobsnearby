import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendClaimListingEmail } from "@/lib/notify";
import { containsContactInfo, CONTACT_INFO_MESSAGE } from "@/lib/contact-guard";

const SITE_URL = "https://findjobsnearby.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SeedPayload = {
  title: string;
  companyName: string;
  city: string;
  state: string;
  payRange: string;
  employmentType: string;
  category: string;
  responsibilities: string[];
  requirements: string[];
  description: string;
  contactEmail: string | null;
  sourceNote: string;
};

function isValidPayload(body: unknown): body is SeedPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.title === "string" && b.title.trim().length > 0 &&
    typeof b.companyName === "string" && b.companyName.trim().length > 0 &&
    typeof b.city === "string" && b.city.trim().length > 0 &&
    typeof b.state === "string" &&
    typeof b.payRange === "string" && b.payRange.trim().length > 0 &&
    typeof b.employmentType === "string" &&
    typeof b.category === "string" &&
    Array.isArray(b.responsibilities) && b.responsibilities.every((item) => typeof item === "string") &&
    b.responsibilities.length >= 3 && b.responsibilities.length <= 5 &&
    Array.isArray(b.requirements) && b.requirements.every((item) => typeof item === "string") && b.requirements.length <= 6 &&
    typeof b.description === "string" && b.description.trim().length > 0 &&
    (b.contactEmail === null || (typeof b.contactEmail === "string" && EMAIL_RE.test(b.contactEmail))) &&
    typeof b.sourceNote === "string"
  );
}

export async function POST(request: Request) {
  // Never trust a client claim of "I'm an admin" -- verify the caller's own
  // session against accounts.role, same as app/admin/page.tsx's server gate.
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const { data: account } = await supabase.from("accounts").select("role").eq("id", userData.user.id).maybeSingle();
  if (account?.role !== "admin") {
    return NextResponse.json({ error: "Admin access only." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "Missing or invalid job details." }, { status: 400 });
  }
  if (containsContactInfo([body.title, body.companyName, body.description, ...body.responsibilities, ...body.requirements].join(" "))) {
    return NextResponse.json({ error: CONTACT_INFO_MESSAGE }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: job, error } = await admin.from("jobs").insert({
    employer_id: null,
    title: body.title,
    company_name: body.companyName,
    city: body.city,
    state: body.state,
    pay_range: body.payRange,
    employment_type: body.employmentType,
    category: body.category,
    responsibilities: body.responsibilities,
    requirements: body.requirements.length > 0 ? body.requirements : null,
    description: body.description,
    status: "published",
    // US-79: description/requirements now come from the same AI drafting
    // (US-3) and must-have extraction (US-62) as an employer's own posting,
    // not hand-typed -- this should carry the same disclosure as those.
    ai_assisted: true,
    approved_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    seed_contact_email: body.contactEmail,
    seed_source_note: body.sourceNote || null,
  }).select("id, claim_token").single();

  if (error || !job) {
    return NextResponse.json({ error: error?.message ?? "Could not seed this listing." }, { status: 500 });
  }

  const claimLink = `${SITE_URL}/claim/${job.claim_token}`;

  if (body.contactEmail) {
    try {
      await sendClaimListingEmail(body.contactEmail, job.claim_token, body.title, body.companyName);
    } catch {
      // The listing is already live and the link is returned either way --
      // a failed send just means the founder needs to share it manually.
    }
  }

  return NextResponse.json({ ok: true, claimLink });
}
