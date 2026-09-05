import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyNewMessage } from "@/lib/notify";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const messageId = body?.messageId;
  if (typeof messageId !== "string") {
    return NextResponse.json({ error: "Missing messageId." }, { status: 400 });
  }

  // Confirm the message actually exists before triggering an email -- this
  // endpoint is called by the browser, so don't trust the id blindly.
  const admin = createSupabaseAdminClient();
  const { data: message } = await admin.from("messages").select("id").eq("id", messageId).maybeSingle();
  if (!message) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  try {
    await notifyNewMessage(messageId);
  } catch (error) {
    // Notification failures shouldn't surface to the sender -- the message
    // itself already sent before this was called. Still report it, otherwise
    // a broken notification path fails silently forever.
    Sentry.captureException(error, { extra: { messageId } });
  }

  return NextResponse.json({ ok: true });
}
