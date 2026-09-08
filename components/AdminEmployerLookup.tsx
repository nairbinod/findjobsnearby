"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Account = { id: string; display_name: string | null; free_views_used: number };
type Unlock = { id: string; candidate_id: string; created_at: string; role_title: string | null };

/** US-76: reset an employer's profile-view standing -- their free-view
 * count, or one specific paid unlock. Looked up by account id (copyable
 * from a job row in AdminJobsPanel's employer_id) rather than email, since
 * accounts has no email column -- that lives in auth.users, reachable only
 * via the service-role Admin API, not worth a new route for this. */
export default function AdminEmployerLookup() {
  const [accountId, setAccountId] = useState("");
  const [account, setAccount] = useState<Account | null>(null);
  const [unlocks, setUnlocks] = useState<Unlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function lookup() {
    const id = accountId.trim();
    if (!id) return;
    setLoading(true);
    setMessage("");
    setAccount(null);
    setUnlocks([]);
    const supabase = createSupabaseBrowserClient();

    const { data: accountRow, error: accountError } = await supabase.from("accounts").select("id, display_name, free_views_used").eq("id", id).eq("role", "employer").maybeSingle();
    if (accountError || !accountRow) { setMessage(accountError?.message ?? "No employer account found with that id."); setLoading(false); return; }

    const { data: unlockRows, error: unlockError } = await supabase.from("paid_profile_views").select("id, candidate_id, created_at").eq("employer_id", id).order("created_at", { ascending: false });
    if (unlockError) { setMessage(unlockError.message); setLoading(false); return; }

    const candidateIds = (unlockRows ?? []).map((row) => row.candidate_id);
    const { data: profiles } = candidateIds.length > 0
      ? await supabase.from("candidate_profiles").select("candidate_id, role_title").in("candidate_id", candidateIds)
      : { data: [] as { candidate_id: string; role_title: string }[] };
    const roleTitleByCandidate = new Map((profiles ?? []).map((profile) => [profile.candidate_id, profile.role_title]));

    setAccount(accountRow);
    setUnlocks((unlockRows ?? []).map((row) => ({ ...row, role_title: roleTitleByCandidate.get(row.candidate_id) ?? null })));
    setLoading(false);
  }

  async function resetFreeViews() {
    if (!account) return;
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("accounts").update({ free_views_used: 0 }).eq("id", account.id).select("id");
    if (error || !data || data.length === 0) { setMessage(error?.message ?? "Could not reset free views."); return; }
    setAccount({ ...account, free_views_used: 0 });
  }

  async function revokeUnlock(unlockId: string) {
    if (!window.confirm("Revoke this unlock? The employer will need to pay again to view this profile.")) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("paid_profile_views").delete().eq("id", unlockId);
    if (error) { setMessage(error.message); return; }
    setUnlocks((current) => current.filter((unlock) => unlock.id !== unlockId));
  }

  return (
    <section>
      <h2 className="text-xl font-bold">Employer lookup</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Paste an employer&apos;s account id — visible on any of their jobs in the panel above — to manage their free views and paid unlocks.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <input value={accountId} onChange={(event) => setAccountId(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void lookup()} placeholder="Employer account id" className="min-w-[280px] flex-1 rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-mono outline-none focus:border-[var(--coral)]" />
        <button onClick={() => void lookup()} disabled={loading} className="rounded-xl bg-[var(--ink)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{loading ? "Looking up..." : "Look up"}</button>
      </div>
      {message && <p className="mt-3 text-sm font-semibold text-[var(--coral)]">{message}</p>}
      {account && (
        <div className="mt-4 rounded-xl border border-[var(--line)] bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-bold">{account.display_name ?? "Unnamed business"}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Free views used: {account.free_views_used}</p>
            </div>
            <button onClick={() => void resetFreeViews()} className="rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-bold text-white">Reset free views</button>
          </div>
          <div className="mt-4 space-y-2 border-t border-[var(--line)] pt-4">
            <p className="text-sm font-bold">Paid unlocks ({unlocks.length})</p>
            {unlocks.length === 0 ? <p className="text-sm text-[var(--muted)]">No paid unlocks yet.</p> : unlocks.map((unlock) => (
              <div key={unlock.id} className="flex items-center justify-between rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
                <span>{unlock.role_title ?? "Candidate"} · Unlocked {new Date(unlock.created_at).toLocaleDateString()}</span>
                <button onClick={() => void revokeUnlock(unlock.id)} className="text-xs font-bold text-[var(--coral)]">Revoke</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
