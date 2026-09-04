import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

/** Lazy singleton -- constructing Stripe with a missing key throws
 * immediately, which would otherwise crash at build/import time for every
 * route that imports this module (same issue hit with the Resend client). */
export function getStripeClient() {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  return client;
}

export const PROFILE_UNLOCK_PRICE_CENTS = 299;
