import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

/** Lazy singleton -- the Resend constructor throws immediately if the API
 * key is missing, which would otherwise crash at build/import time for
 * every route that imports this module, not just when actually sending. */
export function getResendClient() {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

/** Resend's shared testing domain works without DNS verification and can
 * send to any recipient, so notifications work out of the box. Set
 * RESEND_FROM_EMAIL once a custom sending domain is verified in Resend. */
export const NOTIFICATIONS_FROM = process.env.RESEND_FROM_EMAIL || "FindJobsNearBy <onboarding@resend.dev>";
