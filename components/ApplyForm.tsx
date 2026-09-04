"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { containsContactInfo, CONTACT_INFO_MESSAGE } from "@/lib/contact-guard";

type ApplyFormProps = { jobId: string; jobTitle: string; jobCategory?: string };

type ExistingProfile = { id: string; role_title: string; category: string | null; availability: string | null };

const jobCategories = ["Food & hospitality", "Skilled trades", "Care & education", "Operations"] as const;

export default function ApplyForm({ jobId, jobTitle, jobCategory }: ApplyFormProps) {
  const [open, setOpen] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [existingProfiles, setExistingProfiles] = useState<ExistingProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("new");

  const [roleTitle, setRoleTitle] = useState(jobTitle);
  const [category, setCategory] = useState<string>(jobCategory ?? jobCategories[0]);
  const [availability, setAvailability] = useState("");
  const [workHistory, setWorkHistory] = useState("");
  const [approved, setApproved] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [profileStep, setProfileStep] = useState<"form" | "review">("form");
  const [drafting, setDrafting] = useState(false);
  const [curatedContent, setCuratedContent] = useState("");
  const [flags, setFlags] = useState<string[]>([]);

  async function openForm() {
    setOpen(true);
    setLoadingProfiles(true);
    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data } = await supabase.from("candidate_profiles").select("id, role_title, category, availability").eq("candidate_id", userData.user.id).not("approved_at", "is", null).order("created_at", { ascending: false });
      setExistingProfiles(data ?? []);
      if (data?.length) setSelectedProfileId(data[0].id);
    }
    setLoadingProfiles(false);
  }

  function backToForm() {
    setProfileStep("form");
    setApproved(false);
    setMessage("");
  }

  async function draftProfile() {
    if (containsContactInfo(roleTitle) || containsContactInfo(workHistory)) {
      setMessage(CONTACT_INFO_MESSAGE);
      return;
    }

    setDrafting(true);
    setMessage("");
    try {
      const response = await fetch("/api/draft-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleTitle, category, availability, workHistory }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not draft your profile.");
      setCuratedContent(result.curatedContent);
      setFlags(result.flags ?? []);
      setProfileStep("review");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not draft your profile.");
    } finally {
      setDrafting(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedProfileId !== "new") {
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
      const { error: applicationError } = await supabase.from("applications").insert({
        job_id: jobId,
        candidate_id: userData.user.id,
        profile_id: selectedProfileId,
      });
      setMessage(applicationError ? applicationError.message : "Application sent. The employer can now review your profile.");
      if (!applicationError) setOpen(false);
      setBusy(false);
      return;
    }

    if (profileStep === "form") {
      await draftProfile();
      return;
    }

    // profileStep === "review": final approve & apply
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
      category,
      availability,
      curated_content: curatedContent,
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
    return <button onClick={() => void openForm()} className="mt-7 w-full rounded-full bg-[var(--coral)] px-5 py-4 font-bold">Apply for this job <span aria-hidden="true">→</span></button>;
  }

  const isNewProfileReview = selectedProfileId === "new" && profileStep === "review";

  return (
    <form onSubmit={submit} className="mt-6 space-y-5 border-t border-white/15 pt-6">
      <p className="text-sm font-bold">{isNewProfileReview ? "Review your profile" : "Your focused profile"}</p>

      {loadingProfiles && <p className="text-xs text-white/60">Checking your existing profiles...</p>}

      {!loadingProfiles && existingProfiles.length > 0 && profileStep === "form" && (
        <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
          Apply with
          <select value={selectedProfileId} onChange={(event) => setSelectedProfileId(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-white/30 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--yellow)]">
            {existingProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.role_title}{profile.availability ? ` · ${profile.availability}` : ""}</option>)}
            <option value="new">+ Create a new profile for this role</option>
          </select>
        </label>
      )}

      {selectedProfileId === "new" && profileStep === "form" && (
        <>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/60">Role title<input required value={roleTitle} onChange={(event) => setRoleTitle(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-white/30 bg-white px-3 py-3 text-sm font-normal text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--yellow)] focus:ring-2 focus:ring-[var(--yellow)]/30" /></label>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/60">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-white/30 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--yellow)]">{jobCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/60">Availability<input required value={availability} onChange={(event) => setAvailability(event.target.value)} placeholder="e.g. Weekday mornings" className="mt-2 min-h-12 w-full rounded-lg border border-white/30 bg-white px-3 py-3 text-sm font-normal text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--yellow)] focus:ring-2 focus:ring-[var(--yellow)]/30" /></label>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/60">Work history<textarea required value={workHistory} onChange={(event) => setWorkHistory(event.target.value)} rows={4} placeholder="A few notes about your experience" className="mt-2 w-full resize-none rounded-lg border border-white/30 bg-white px-3 py-3 text-sm font-normal text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--yellow)] focus:ring-2 focus:ring-[var(--yellow)]/30" /></label>
        </>
      )}

      {isNewProfileReview && (
        <div className="space-y-4">
          <div className="rounded-lg border border-white/30 bg-white p-4 text-sm leading-6 text-[var(--ink)]">{curatedContent}</div>
          {flags.length > 0 && (
            <div className="rounded-lg border border-[var(--yellow)] bg-white/10 p-3 text-xs leading-5 text-white/80">
              Your work history includes wording that may reveal more than you intend: {flags.map((flag) => `"${flag}"`).join(", ")}. Edit it if you&apos;d like, then draft again.
            </div>
          )}
          <p className="text-xs leading-5 text-white/60">AI-assisted draft. Only the details you provided are included. Nothing is visible to employers until you approve it.</p>
          <label className="flex gap-3 text-xs leading-5 text-white/70"><input required type="checkbox" checked={approved} onChange={(event) => setApproved(event.target.checked)} className="mt-1 h-4 w-4 accent-[var(--yellow)]" /> I approve this profile for employers to review.</label>
          <button type="button" onClick={backToForm} className="text-xs font-bold text-white/70 underline underline-offset-4">Edit details</button>
        </div>
      )}

      <button disabled={busy || loadingProfiles || drafting} className="w-full rounded-full bg-[var(--yellow)] px-5 py-4 font-bold text-[var(--ink)] disabled:opacity-60">
        {drafting ? "Drafting with AI..." : busy ? "Sending..." : isNewProfileReview ? "Approve & apply" : selectedProfileId === "new" ? "Draft my profile" : "Send application"} <span aria-hidden="true">→</span>
      </button>
      {message && <p role="status" className="text-sm leading-5 text-white/80">{message}</p>}
    </form>
  );
}
