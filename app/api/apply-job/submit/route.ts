import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendCandidateConfirmationEmail } from "@/lib/notify";
import { containsContactInfo, CONTACT_INFO_MESSAGE } from "@/lib/contact-guard";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_UNCONFIRMED_PER_EMAIL = 3;
const RATE_WINDOW_HOURS = 24;

type SubmitPayload = {
  email: string;
  jobId: string;
  jobTitle: string;
  roleTitle: string;
  category: string;
  availability: string;
  availableFrom: string | null;
  availableUntil: string | null;
  desiredPay: string | null;
  workHistory: string;
  curatedContent: string;
  approved: boolean;
  requirementMatches: string[];
  requirementNotes: string | null;
  hasRequirements: boolean;
};

function isValidPayload(body: unknown): body is SubmitPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.email === "string" && EMAIL_RE.test(b.email.trim()) &&
    typeof b.jobId === "string" && b.jobId.trim().length > 0 && !b.jobId.startsWith("demo-") &&
    typeof b.jobTitle === "string" &&
    typeof b.roleTitle === "string" && b.roleTitle.trim().length > 0 &&
    typeof b.category === "string" &&
    typeof b.availability === "string" && b.availability.trim().length > 0 &&
    (b.availableFrom === null || typeof b.availableFrom === "string") &&
    (b.availableUntil === null || typeof b.availableUntil === "string") &&
    (b.desiredPay === null || typeof b.desiredPay === "string") &&
    typeof b.workHistory === "string" && b.workHistory.trim().length > 0 &&
    typeof b.curatedContent === "string" &&
    typeof b.approved === "boolean" &&
    Array.isArray(b.requirementMatches) && b.requirementMatches.every((item) => typeof item === "string") &&
    (b.requirementNotes === null || typeof b.requirementNotes === "string") &&
    typeof b.hasRequirements === "boolean"
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "Missing or invalid application details." }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const textToScan = [body.roleTitle, body.workHistory, body.requirementNotes ?? ""].join(" ");
  if (containsContactInfo(textToScan)) {
    return NextResponse.json({ error: CONTACT_INFO_MESSAGE }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: job } = await admin.from("jobs").select("id").eq("id", body.jobId).maybeSingle();
  if (!job) {
    return NextResponse.json({ error: "This job listing could not be found." }, { status: 404 });
  }

  // US-71's own AC: cap unconfirmed submissions per email, since this is
  // another path in the product reachable with no account and no session.
  const since = new Date(Date.now() - RATE_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("pending_candidate_submissions")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .is("confirmed_at", null)
    .gte("created_at", since);

  if ((count ?? 0) >= MAX_UNCONFIRMED_PER_EMAIL) {
    return NextResponse.json({ error: "Too many unconfirmed applications for this email recently. Check your inbox for earlier confirmation links, or try again later." }, { status: 429 });
  }

  const { data: pending, error } = await admin
    .from("pending_candidate_submissions")
    .insert({ email, job_id: body.jobId, payload: body })
    .select("confirmation_token")
    .single();

  if (error || !pending) {
    return NextResponse.json({ error: "Could not save your application. Try again in a moment." }, { status: 500 });
  }

  try {
    await sendCandidateConfirmationEmail(email, pending.confirmation_token, body.jobTitle);
  } catch {
    return NextResponse.json({ error: "Your application was saved, but we couldn't send the confirmation email. Try again in a moment." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
