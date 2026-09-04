import type { SupabaseClient } from "@supabase/supabase-js";

export const REFERRAL_COOKIE = "fjn_ref";

/** US-34: attributes a new account to whoever shared the referral link that
 * brought them here. Silently no-ops on an unknown code or a self-referral. */
export async function recordReferral(supabase: SupabaseClient, referralCode: string, newAccountId: string) {
  const { data: referrerId } = await supabase.rpc("referrer_id_for_code", { code: referralCode });
  if (!referrerId || referrerId === newAccountId) return;
  await supabase.from("referrals").insert({ referrer_id: referrerId, referred_account_id: newAccountId });
}
