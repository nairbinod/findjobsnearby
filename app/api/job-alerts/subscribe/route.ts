import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CATEGORIES = ["Food & hospitality", "Skilled trades", "Care & education", "Operations"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const category = typeof body?.category === "string" && CATEGORIES.includes(body.category) ? body.category : null;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("job_alert_subscribers")
    .upsert({ email, category, unsubscribed_at: null }, { onConflict: "email" });

  if (error) {
    return NextResponse.json({ error: "Could not save your subscription. Try again in a moment." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
