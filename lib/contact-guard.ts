const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE_RE = /(\+?1[-. ]?)?\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}/;

/** Mirrors the Postgres trigger in 202609030006_foundation_trust.sql so
 * users get an inline error before hitting the database (US-27). Contact
 * info is still blocked server-side even if this check is bypassed. */
export function containsContactInfo(value: string) {
  return EMAIL_RE.test(value) || PHONE_RE.test(value);
}

export const CONTACT_INFO_MESSAGE = "Remove phone numbers or email addresses — employers and candidates connect through the platform once a paid view unlocks contact.";
