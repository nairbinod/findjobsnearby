import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyProfileViewed } from "@/lib/notify";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: Record<string, string>; payment_intent?: string | null };
    const employerId = session.metadata?.employer_id;
    const candidateId = session.metadata?.candidate_id;
    const applicationId = session.metadata?.application_id || null;

    if (employerId && candidateId) {
      const admin = createSupabaseAdminClient();

      // Idempotent: Stripe may deliver the same event more than once.
      // The unique(employer_id, candidate_id) constraint makes a repeat
      // insert a no-op rather than an error or a duplicate unlock/email.
      const { data: view } = await admin
        .from("paid_profile_views")
        .upsert(
          { employer_id: employerId, candidate_id: candidateId, application_id: applicationId, stripe_payment_id: session.payment_intent ?? null },
          { onConflict: "employer_id,candidate_id", ignoreDuplicates: true },
        )
        .select("id")
        .maybeSingle();

      if (view) void notifyProfileViewed(view.id);
    }
  }

  return NextResponse.json({ received: true });
}
