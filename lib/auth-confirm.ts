import type { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;
type AccountRole = "employer" | "candidate";

type LinkData = {
  user: { id: string };
  properties: { hashed_token: string; verification_type: string };
};

/**
 * Shared by every "confirm via emailed link" route (job posting, job
 * application, listing claim): finds or creates the auth user + accounts
 * row for this email, without ever overwriting an existing account's role.
 * Returns null if either step fails.
 */
export async function findOrCreateAccount(
  admin: AdminClient,
  email: string,
  role: AccountRole,
): Promise<{ userId: string; linkData: LinkData } | null> {
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { data: { role } },
  });
  if (linkError || !linkData.user) return null;
  const userId = linkData.user.id;

  const { data: account } = await admin.from("accounts").select("id").eq("id", userId).maybeSingle();
  if (!account) {
    const { error: accountError } = await admin.from("accounts").insert({ id: userId, role });
    if (accountError) return null;
  }

  return { userId, linkData: linkData as unknown as LinkData };
}

/**
 * Signs the current browser in as a real session using the hashed_token
 * from findOrCreateAccount's generateLink call. Must use whatever
 * verification_type generateLink actually returned -- for a brand-new
 * email it comes back "signup", not "magiclink", and verifyOtp rejects the
 * token as invalid/expired if called with the wrong one.
 */
export async function signInWithLink(linkData: LinkData) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: linkData.properties.verification_type as "magiclink" | "signup",
  });
}
