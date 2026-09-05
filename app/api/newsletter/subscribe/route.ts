import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("newsletter_subscribers")
    .upsert({ email, unsubscribed_at: null }, { onConflict: "email" });

  if (error) {
    return NextResponse.json({ error: "Could not save your subscription. Try again in a moment." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
