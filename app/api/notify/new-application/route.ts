import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyNewApplication } from "@/lib/notify";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const applicationId = body?.applicationId;
  if (typeof applicationId !== "string") {
    return NextResponse.json({ error: "Missing applicationId." }, { status: 400 });
  }

  // Confirm the application actually exists before triggering an email --
  // this endpoint is called by the browser, so don't trust the id blindly.
  const admin = createSupabaseAdminClient();
  const { data: application } = await admin.from("applications").select("id").eq("id", applicationId).maybeSingle();
  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  try {
    await notifyNewApplication(applicationId);
  } catch {
    // Notification failures shouldn't surface to the candidate -- the
    // application itself already succeeded before this was called.
  }

  return NextResponse.json({ ok: true });
}
