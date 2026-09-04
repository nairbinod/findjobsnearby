import { NextResponse } from "next/server";
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
  } catch {
    // Notification failures shouldn't surface to the sender -- the message
    // itself already sent before this was called.
  }

  return NextResponse.json({ ok: true });
}
