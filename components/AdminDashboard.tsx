"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Flag = { id: string; target_type: "job" | "profile"; target_id: string; reason: string; status: string; created_at: string; label?: string };
type UnverifiedEmployer = { id: string; display_name: string | null; phone: string | null; phone_verified_at: string | null; created_at: string };
type Dispute = { id: string; employer_id: string; paid_profile_view_id: string; reason: string; status: string; created_at: string };

export default function AdminDashboard() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [employers, setEmployers] = useState<UnverifiedEmployer[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchDashboardData() {
    const supabase = createSupabaseBrowserClient();
    const [{ data: flagData }, { data: employerData }, { data: disputeData }] = await Promise.all([
      supabase.from("flags").select("id, target_type, target_id, reason, status, created_at").eq("status", "open").order("created_at", { ascending: false }),
      supabase.from("accounts").select("id, display_name, phone, phone_verified_at, created_at").eq("role", "employer").is("verified_at", null).order("created_at", { ascending: false }),
      supabase.from("disputes").select("id, employer_id, paid_profile_view_id, reason, status, created_at").eq("status", "open").order("created_at", { ascending: false }),
    ]);

    const enrichedFlags = await Promise.all((flagData ?? []).map(async (flag) => {
      const table = flag.target_type === "job" ? "jobs" : "candidate_profiles";
      const column = flag.target_type === "job" ? "title" : "role_title";
      const { data } = await supabase.from(table).select(column).eq("id", flag.target_id).maybeSingle();
      return { ...flag, label: (data as Record<string, string> | null)?.[column] ?? "(removed)" };
    }));

    return { flags: enrichedFlags, employers: employerData ?? [], disputes: disputeData ?? [] };
  }

  async function load() {
    const data = await fetchDashboardData();
    setFlags(data.flags);
    setEmployers(data.employers);
    setDisputes(data.disputes);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetchDashboardData().then((data) => {
      if (cancelled) return;
      setFlags(data.flags);
      setEmployers(data.employers);
      setDisputes(data.disputes);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  async function resolveFlag(flag: Flag, status: "reviewed" | "dismissed", takeDown: boolean) {
    const supabase = createSupabaseBrowserClient();
    if (takeDown) {
      if (flag.target_type === "job") await supabase.from("jobs").update({ status: "closed" }).eq("id", flag.target_id);
      else await supabase.from("candidate_profiles").update({ approved_at: null }).eq("id", flag.target_id);
    }
    await supabase.from("flags").update({ status }).eq("id", flag.id);
    void load();
  }

  async function verifyEmployer(id: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("accounts").update({ verified_at: new Date().toISOString() }).eq("id", id);
    void load();
  }

  async function resolveDispute(id: string, status: "resolved" | "denied") {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("disputes").update({ status }).eq("id", id);
    void load();
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link>
        <span className="rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-bold uppercase text-white">Admin</span>
      </header>
      <main className="mx-auto max-w-[1100px] px-6 pb-20 pt-6 lg:px-10">
        <h1 className="display text-4xl font-bold">Moderation dashboard</h1>
        {loading ? <p className="mt-8 text-[var(--muted)]">Loading...</p> : (
          <div className="mt-10 space-y-14">
            <section>
              <h2 className="text-xl font-bold">Flagged content <span className="text-sm font-normal text-[var(--muted)]">({flags.length} open)</span></h2>
              {flags.length === 0 ? <p className="mt-4 text-sm text-[var(--muted)]">Nothing flagged right now.</p> : (
                <div className="mt-4 space-y-3">
                  {flags.map((flag) => (
                    <article key={flag.id} className="rounded-xl border border-[var(--line)] bg-white p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--coral)]">{flag.target_type}</p>
                          <p className="mt-1 font-bold">{flag.label}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">{flag.reason}</p>
                        </div>
                        <span className="whitespace-nowrap text-xs text-[var(--muted)]">{new Date(flag.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">
                        <button onClick={() => void resolveFlag(flag, "dismissed", false)} className="text-[var(--muted)]">Dismiss</button>
                        <button onClick={() => void resolveFlag(flag, "reviewed", false)} className="text-[var(--ink)]">Mark reviewed</button>
                        <button onClick={() => void resolveFlag(flag, "reviewed", true)} className="text-[var(--coral)]">{flag.target_type === "job" ? "Close listing" : "Revoke profile approval"}</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold">Employer verification <span className="text-sm font-normal text-[var(--muted)]">({employers.length} pending)</span></h2>
              {employers.length === 0 ? <p className="mt-4 text-sm text-[var(--muted)]">No employers waiting on verification.</p> : (
                <div className="mt-4 space-y-3">
                  {employers.map((employer) => (
                    <article key={employer.id} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-white p-4">
                      <div>
                        <p className="font-bold">{employer.display_name ?? "Unnamed business"}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{employer.phone ?? "No phone on file"}{employer.phone_verified_at ? " · Phone verified" : ""}</p>
                      </div>
                      <button onClick={() => void verifyEmployer(employer.id)} className="rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-bold text-white">Mark verified</button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold">Disputes <span className="text-sm font-normal text-[var(--muted)]">({disputes.length} open)</span></h2>
              {disputes.length === 0 ? <p className="mt-4 text-sm text-[var(--muted)]">No open disputes.</p> : (
                <div className="mt-4 space-y-3">
                  {disputes.map((dispute) => (
                    <article key={dispute.id} className="rounded-xl border border-[var(--line)] bg-white p-4">
                      <p className="text-sm">{dispute.reason}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">Filed {new Date(dispute.created_at).toLocaleDateString()}</p>
                      <div className="mt-3 flex gap-3 text-xs font-bold">
                        <button onClick={() => void resolveDispute(dispute.id, "resolved")} className="text-[var(--ink)]">Resolve (refund)</button>
                        <button onClick={() => void resolveDispute(dispute.id, "denied")} className="text-[var(--muted)]">Deny</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
