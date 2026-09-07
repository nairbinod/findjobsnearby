/** US-64-69: the fixed system account that a founder-seeded listing is
 * attached to until the real business claims it. Created once via the
 * admin API (not a migration -- auth.users isn't something migrations
 * should write to directly). employer_id is never null on jobs, so this
 * placeholder is what makes an unclaimed listing a valid row at all. */
export const UNCLAIMED_PLACEHOLDER_ACCOUNT_ID = "1307c3bc-f825-49f9-8ee4-2274905a79bf";

/** A seeded listing that hasn't been claimed auto-expires sooner than the
 * standard 30-day window (US-69) -- it was never verified by anyone who
 * can act on it. */
export const UNCLAIMED_EXPIRY_DAYS = 14;
