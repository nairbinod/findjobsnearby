"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ApplyFormProps = { jobId: string; jobTitle: string };

export default function ApplyForm({ jobId, jobTitle }: ApplyFormProps) {
  const [open, setOpen] = useState(false);
  const [roleTitle, setRoleTitle] = useState(jobTitle);
  const [availability, setAvailability] = useState("");
  const [workHistory, setWorkHistory] = useState("");
  const [approved, setApproved] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setMessage("Sign in first, then come back to apply with your profile.");
      setBusy(false);
      return;
    }

    if (jobId.startsWith("demo-")) {
      setMessage("This preview role is not accepting applications yet. Live roles will be connected to Supabase.");
      setBusy(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase.from("candidate_profiles").insert({
      candidate_id: userData.user.id,
      role_title: roleTitle,
      availability,
      approved_at: approved ? new Date().toISOString() : null,
    }).select("id").single();

    if (profileError || !profile) {
      setMessage(profileError?.message ?? "We could not create your profile.");
      setBusy(false);
      return;
    }

    const { error: privateProfileError } = await supabase.from("candidate_profile_private").insert({
      profile_id: profile.id,
      candidate_id: userData.user.id,
      work_history: workHistory,
    });

    if (privateProfileError) {
      setMessage(privateProfileError.message);
      setBusy(false);
      return;
    }

    const { error: applicationError } = await supabase.from("applications").insert({
      job_id: jobId,
      candidate_id: userData.user.id,
      profile_id: profile.id,
    });

    setMessage(applicationError ? applicationError.message : "Application sent. The employer can now review your profile.");
    if (!applicationError) setOpen(false);
    setBusy(false);
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="mt-7 w-full rounded-full bg-[var(--coral)] px-5 py-4 font-bold">Apply for this job <span aria-hidden="true">→</span></button>;
  }

  return <form onSubmit={submit} className="mt-6 space-y-5 border-t border-white/15 pt-6"><p className="text-sm font-bold">Your focused profile</p><label className="block text-xs font-bold uppercase tracking-wider text-white/60">Role title<input required value={roleTitle} onChange={(event) => setRoleTitle(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-white/30 bg-white px-3 py-3 text-sm font-normal text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--yellow)] focus:ring-2 focus:ring-[var(--yellow)]/30" /></label><label className="block text-xs font-bold uppercase tracking-wider text-white/60">Availability<input required value={availability} onChange={(event) => setAvailability(event.target.value)} placeholder="e.g. Weekday mornings" className="mt-2 min-h-12 w-full rounded-lg border border-white/30 bg-white px-3 py-3 text-sm font-normal text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--yellow)] focus:ring-2 focus:ring-[var(--yellow)]/30" /></label><label className="block text-xs font-bold uppercase tracking-wider text-white/60">Work history<textarea required value={workHistory} onChange={(event) => setWorkHistory(event.target.value)} rows={4} placeholder="A few notes about your experience" className="mt-2 w-full resize-none rounded-lg border border-white/30 bg-white px-3 py-3 text-sm font-normal text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--yellow)] focus:ring-2 focus:ring-[var(--yellow)]/30" /></label><label className="flex gap-3 text-xs leading-5 text-white/70"><input required type="checkbox" checked={approved} onChange={(event) => setApproved(event.target.checked)} className="mt-1 h-4 w-4 accent-[var(--yellow)]" /> I approve this profile for employers to review.</label><button disabled={busy} className="w-full rounded-full bg-[var(--yellow)] px-5 py-4 font-bold text-[var(--ink)] disabled:opacity-60">{busy ? "Sending..." : "Send application"} <span aria-hidden="true">→</span></button>{message && <p role="status" className="text-sm leading-5 text-white/80">{message}</p>}</form>;
}
