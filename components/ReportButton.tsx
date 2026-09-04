"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ReportButtonProps = { targetType: "job" | "profile"; targetId: string; label?: string };

export default function ReportButton({ targetType, targetId, label = "Report this listing" }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setMessage("Sign in to report a problem.");
      setBusy(false);
      return;
    }

    const { error } = await supabase.from("flags").insert({
      target_type: targetType,
      target_id: targetId,
      reporter_id: userData.user.id,
      reason,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setSent(true);
    }
    setBusy(false);
  }

  if (sent) return <p className="text-xs text-[var(--muted)]">Thanks — our team will take a look.</p>;

  if (!open) {
    return <button onClick={() => setOpen(true)} className="text-xs font-semibold text-[var(--muted)] underline decoration-dotted underline-offset-4 hover:text-[var(--ink)]">{label}</button>;
  }

  return (
    <form onSubmit={submit} className="mt-2 max-w-sm space-y-2 rounded-xl border border-[var(--line)] bg-white p-3">
      <label className="block text-xs font-bold text-[var(--muted)]">
        What&apos;s wrong?
        <textarea required value={reason} onChange={(event) => setReason(event.target.value)} rows={2} placeholder="e.g. Contains contact info, looks fake, wrong pay listed" className="mt-1 w-full resize-none rounded-lg border border-[var(--line)] px-2 py-2 text-xs font-normal text-[var(--ink)] outline-none focus:border-[var(--coral)]" />
      </label>
      <div className="flex items-center gap-3">
        <button disabled={busy} className="rounded-full bg-[var(--ink)] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">{busy ? "Sending..." : "Submit report"}</button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs font-semibold text-[var(--muted)]">Cancel</button>
      </div>
      {message && <p role="status" className="text-xs text-[var(--coral)]">{message}</p>}
    </form>
  );
}
