import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeClient, PROFILE_UNLOCK_PRICE_CENTS } from "@/lib/stripe";
import { notifyProfileViewed } from "@/lib/notify";

const SITE_URL = "https://findjobsnearby.com";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const candidateId = typeof body?.candidateId === "string" ? body.candidateId : null;
  const applicationId = typeof body?.applicationId === "string" ? body.applicationId : null;
  if (!candidateId) {
    return NextResponse.json({ error: "Missing candidateId." }, { status: 400 });
  }

  // Identify the caller from their own session -- never trust a
  // client-supplied employer id for a paywall decision.
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const employerId = userData.user.id;

  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from("paid_profile_views")
    .select("id")
    .eq("employer_id", employerId)
    .eq("candidate_id", candidateId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ unlocked: true, free: false, alreadyUnlocked: true });
  }

  const { data: claimedFree } = await admin.rpc("claim_free_profile_view", { p_employer_id: employerId });
  if (claimedFree === true) {
    const { data: view, error } = await admin
      .from("paid_profile_views")
      .insert({ employer_id: employerId, candidate_id: candidateId, application_id: applicationId, stripe_payment_id: null })
      .select("id")
      .single();
    if (error || !view) {
      return NextResponse.json({ error: error?.message ?? "Could not unlock this profile." }, { status: 500 });
    }
    void notifyProfileViewed(view.id);
    return NextResponse.json({ unlocked: true, free: true });
  }

  // Free views exhausted -- charge $2.99 via Stripe Checkout. The actual
  // unlock happens from the webhook, not this redirect (see
  // app/api/webhooks/stripe/route.ts) -- a redirect URL isn't a trustworthy
  // signal that payment actually succeeded.
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: PROFILE_UNLOCK_PRICE_CENTS,
        product_data: { name: "Unlock candidate profile" },
      },
      quantity: 1,
    }],
    metadata: { employer_id: employerId, candidate_id: candidateId, application_id: applicationId ?? "" },
    success_url: `${SITE_URL}/employer?unlocked=1`,
    cancel_url: `${SITE_URL}/employer`,
  });

  return NextResponse.json({ checkoutUrl: session.url });
}
