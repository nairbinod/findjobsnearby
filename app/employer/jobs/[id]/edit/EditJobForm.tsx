"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { buildJobHref } from "@/lib/geo";
import { containsContactInfo, CONTACT_INFO_MESSAGE } from "@/lib/contact-guard";

const employmentTypes = [
  ["Full-time", "full_time"],
  ["Part-time", "part_time"],
  ["Contract", "contract"],
  ["Seasonal", "seasonal"],
] as const;

const jobCategories = ["Food & hospitality", "Skilled trades", "Care & education", "Operations"] as const;

type ExistingJob = {
  id: string;
  title: string;
  company_name: string;
  city: string;
  address: string | null;
  urgent: boolean;
  pay_range: string;
  employment_type: string;
  category: string | null;
  responsibilities: string[];
  requirements: string[] | null;
  status: string;
};

export default function EditJobForm({ job }: { job: ExistingJob }) {
  const [title, setTitle] = useState(job.title);
  const [companyName, setCompanyName] = useState(job.company_name);
  const [pay, setPay] = useState(job.pay_range);
  const [location, setLocation] = useState(job.city);
  const [address, setAddress] = useState(job.address ?? "");
  const [urgent, setUrgent] = useState(job.urgent);
  const [type, setType] = useState(job.employment_type);
  const [category, setCategory] = useState<string>(job.category ?? jobCategories[0]);
  const [responsibilities, setResponsibilities] = useState(job.responsibilities.join("\n"));
  const [requirements, setRequirements] = useState((job.requirements ?? []).join("\n"));

  const [draft, setDraft] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [flags, setFlags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  async function createDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const responsibilityList = responsibilities.split("\n").map((item) => item.trim()).filter(Boolean);
    if (responsibilityList.length < 3 || responsibilityList.length > 5) {
      setMessage("Add 3 to 5 responsibilities, with one responsibility on each line.");
      return;
    }
    if (requirements.split("\n").map((item) => item.trim()).filter(Boolean).length > 6) {
      setMessage("Add up to 6 requirements, with one requirement on each line.");
      return;
    }
    if (containsContactInfo(title) || containsContactInfo(companyName) || containsContactInfo(responsibilities) || containsContactInfo(requirements)) {
      setMessage(CONTACT_INFO_MESSAGE);
      return;
    }

    setDrafting(true);
    setMessage("");
    try {
      const response = await fetch("/api/draft-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, companyName, city: location, state: "TX", employmentType: type, payRange: pay, responsibilities: responsibilityList }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not draft the update.");
      setAiDescription(result.description);
      setFlags(result.flags ?? []);
      setDraft(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not draft the update.");
    } finally {
      setDrafting(false);
    }
  }

  async function saveChanges() {
    setSaving(true);
    setMessage("");
    const responsibilityList = responsibilities.split("\n").map((item) => item.trim()).filter(Boolean);
    const requirementList = requirements.split("\n").map((item) => item.trim()).filter(Boolean);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("jobs").update({
      title,
      company_name: companyName,
      city: location,
      address: address.trim() || null,
      urgent,
      pay_range: pay,
      employment_type: type,
      category,
      responsibilities: responsibilityList,
      requirements: requirementList.length > 0 ? requirementList : null,
      description: aiDescription,
      updated_at: new Date().toISOString(),
    }).eq("id", job.id).select("id");

    // A Supabase update that RLS silently filters out (0 matching rows)
    // returns no error -- the request is well-formed, it just didn't apply
    // to anything from this user's perspective. Without checking that a row
    // actually came back, this would falsely report "Changes saved."
    if (error) {
      setMessage(error.message);
    } else if (!data || data.length === 0) {
      setMessage("Could not save -- this listing may no longer belong to your account.");
    } else {
      setSaved(true);
    }
    setSaving(false);
  }

  const jobUrl = buildJobHref(job.id, title, location, "TX");

  if (saved) {
    return (
      <div className="min-h-screen bg-[var(--cream)]">
        <main className="mx-auto max-w-[700px] px-6 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--yellow)] text-2xl">✓</div>
          <h1 className="display mt-6 text-4xl font-bold">Changes saved.</h1>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={jobUrl} className="rounded-full bg-[var(--coral)] px-6 py-4 text-center font-bold text-white">View listing <span aria-hidden="true">→</span></Link>
            <Link href="/employer" className="rounded-full border-2 border-[var(--ink)] px-6 py-4 text-center font-bold">Back to dashboard <span aria-hidden="true">→</span></Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link>
        <Link href="/employer" className="text-sm font-bold text-[var(--muted)]">Back to dashboard <span aria-hidden="true">→</span></Link>
      </header>
      <main className="mx-auto max-w-[1000px] px-6 pb-20 pt-12 lg:px-10">
        <div className="mb-12 max-w-[650px]">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Edit listing</p>
          <h1 className="display text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-6xl">Update your posting.</h1>
          {job.status !== "published" && <p className="mt-4 rounded-xl bg-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--ink)]">This listing is {job.status} — changes save, but it stays hidden from candidates.</p>}
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_.85fr]">
          <form onSubmit={createDraft} className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <div className="space-y-5">
              <label className="block text-sm font-bold">Business name<input required value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
              <label className="block text-sm font-bold">Job title<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
              <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-bold">Pay range <span className="text-[var(--coral)]">*</span><input required value={pay} onChange={(event) => setPay(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label><label className="block text-sm font-bold">Employment type<select value={type} onChange={(event) => setType(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 font-normal outline-none">{employmentTypes.map(([label, value]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
              <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-bold">City<input required value={location} onChange={(event) => setLocation(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label><label className="block text-sm font-bold">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 font-normal outline-none">{jobCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div>
              <label className="block text-sm font-bold">Street address <span className="font-normal text-[var(--muted)]">(optional)</span><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="e.g. 412 Magnolia Ave" className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
              <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={urgent} onChange={(event) => setUrgent(event.target.checked)} className="h-5 w-5 rounded border-[var(--line)] accent-[var(--coral)]" />Mark as Urgently Hiring<span className="font-normal text-[var(--muted)]">— adds a badge to your listing</span></label>
              <label className="block text-sm font-bold">What will they do?<span className="mt-1 block text-xs font-normal text-[var(--muted)]">3-5 responsibilities, one per line. {responsibilities.split("\n").map((item) => item.trim()).filter(Boolean).length}/5</span><textarea required value={responsibilities} onChange={(event) => setResponsibilities(event.target.value)} rows={5} className="mt-2 w-full resize-none rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
              <label className="block text-sm font-bold">Requirements <span className="font-normal text-[var(--muted)]">(optional)</span><span className="mt-1 block text-xs font-normal text-[var(--muted)]">Up to 6, one per line. {requirements.split("\n").map((item) => item.trim()).filter(Boolean).length}/6</span><textarea value={requirements} onChange={(event) => setRequirements(event.target.value)} rows={3} className="mt-2 w-full resize-none rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
            </div>
            <button type="submit" disabled={drafting} className="mt-8 w-full rounded-full bg-[var(--coral)] px-6 py-4 font-bold text-white shadow-[0_6px_0_#ce5a4b] disabled:opacity-60">{drafting ? "Drafting update..." : "Draft update"} <span aria-hidden="true">→</span></button>
            {!drafting && message && !draft && <p role="status" className="mt-4 text-sm leading-5 text-[var(--coral)]">{message}</p>}
          </form>
          <aside className="rounded-2xl border border-[var(--line)] bg-[var(--mint)] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--coral)]">{draft ? "Review before saving" : "Preview"}</p>
            {draft ? (
              <div className="mt-8">
                {urgent && <span className="mb-3 inline-block rounded-full bg-[var(--coral)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Urgently hiring</span>}
                <h2 className="display text-3xl font-bold">{title}</h2>
                <p className="mt-2 font-semibold">{companyName} · {address ? `${address}, ${location}` : location} · {type.replace("_", "-")}</p>
                <p className="mt-1 font-bold text-[var(--coral)]">{pay}</p>
                {flags.length > 0 && <div className="mt-6 rounded-xl border border-[var(--coral)] bg-white/70 p-4"><p className="text-xs font-bold uppercase tracking-wider text-[var(--coral)]">Review before saving</p><p className="mt-2 text-sm leading-6">Wording that may be exclusionary or legally risky: {flags.map((flag) => `"${flag}"`).join(", ")}.</p></div>}
                <div className="mt-8 border-t border-[var(--ink)]/15 pt-5"><p className="text-sm leading-7">{aiDescription}</p></div>
                {requirements.split("\n").map((item) => item.trim()).filter(Boolean).length > 0 && <div className="mt-6 border-t border-[var(--ink)]/15 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Requirements</p><div className="mt-2 space-y-1 text-sm leading-7 text-[var(--ink)]/70">{requirements.split("\n").map((item) => item.trim()).filter(Boolean).map((item) => <span className="block" key={item}>☐ {item}</span>)}</div></div>}
                <button onClick={() => void saveChanges()} disabled={saving} className="mt-8 w-full rounded-full bg-[var(--ink)] px-6 py-4 font-bold text-white disabled:opacity-60">{saving ? "Saving..." : "Save changes"} <span aria-hidden="true">↗</span></button>
                <button type="button" onClick={() => setDraft(false)} className="mt-3 w-full text-center text-xs font-bold text-[var(--ink)]/70 underline underline-offset-4">Edit details again</button>
                {message && <p role="status" className="mt-4 text-sm leading-5 text-[var(--muted)]">{message}</p>}
              </div>
            ) : (
              <p className="mt-8 text-sm leading-6 text-[var(--ink)]/70">Update the details, then draft your changes to review before they save.</p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
