import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendJobConfirmationEmail } from "@/lib/notify";
import { containsContactInfo, CONTACT_INFO_MESSAGE } from "@/lib/contact-guard";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_UNCONFIRMED_PER_EMAIL = 3;
const RATE_WINDOW_HOURS = 24;

type SubmitPayload = {
  email: string;
  title: string;
  companyName: string;
  city: string;
  state: string;
  address: string | null;
  urgent: boolean;
  payRange: string;
  employmentType: string;
  category: string;
  responsibilities: string[];
  requirements: string[];
  description: string;
};

function isValidPayload(body: unknown): body is SubmitPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.email === "string" && EMAIL_RE.test(b.email.trim()) &&
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
    typeof b.description === "string" &&
    (b.address === null || typeof b.address === "string") &&
    typeof b.urgent === "boolean"
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "Missing or invalid job details." }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const textToScan = [body.title, body.companyName, body.description, ...body.responsibilities, ...body.requirements].join(" ");
  if (containsContactInfo(textToScan)) {
    return NextResponse.json({ error: CONTACT_INFO_MESSAGE }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // US-70's own AC: cap unconfirmed submissions per email, since this is the
  // one path in the product reachable with no account and no session.
  const since = new Date(Date.now() - RATE_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("pending_job_submissions")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .is("confirmed_at", null)
    .gte("created_at", since);

  if ((count ?? 0) >= MAX_UNCONFIRMED_PER_EMAIL) {
    return NextResponse.json({ error: "Too many unconfirmed listings for this email recently. Check your inbox for earlier confirmation links, or try again later." }, { status: 429 });
  }

  const { data: pending, error } = await admin
    .from("pending_job_submissions")
    .insert({ email, payload: body })
    .select("confirmation_token")
    .single();

  if (error || !pending) {
    return NextResponse.json({ error: "Could not save your listing. Try again in a moment." }, { status: 500 });
  }

  try {
    await sendJobConfirmationEmail(email, pending.confirmation_token, body.title);
  } catch {
    return NextResponse.json({ error: "Your listing was saved, but we couldn't send the confirmation email. Try again in a moment." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
