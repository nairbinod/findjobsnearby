import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Service-role client: bypasses RLS entirely. Only for server-side code
 * that needs to look up another user's email (via the Auth Admin API) or
 * write to tables with no public policies, like notification_log. Never
 * import this from a client component or expose the key to the browser. */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
