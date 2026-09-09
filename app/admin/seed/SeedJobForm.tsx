"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { containsContactInfo, CONTACT_INFO_MESSAGE } from "@/lib/contact-guard";

const employmentTypes = [
  ["Full-time", "full_time"],
  ["Part-time", "part_time"],
  ["Contract", "contract"],
  ["Seasonal", "seasonal"],
] as const;

const jobCategories = ["Food & hospitality", "Skilled trades", "Care & education", "Operations"] as const;

/** US-79: seeded listings now go through the same AI drafting (US-3) and
 * must-have extraction (US-62) as an employer's own posting flow, instead
 * of the admin hand-typing a description. Two-phase like app/post/PostForm
 * -- draft via /api/draft-listing, review, then publish via
 * /api/admin/seed-job with the drafted description/requirements included. */
export default function SeedJobForm() {
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [pay, setPay] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("full_time");
  const [category, setCategory] = useState<string>(jobCategories[0]);
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [requirementQuestions, setRequirementQuestions] = useState<string[]>([]);
  const [suggestedPreferred, setSuggestedPreferred] = useState<string[]>([]);
  const [selectedPreferred, setSelectedPreferred] = useState<Set<string>>(new Set());
  const [contactEmail, setContactEmail] = useState("");
  const [sourceNote, setSourceNote] = useState("");

  const [draft, setDraft] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [flags, setFlags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [claimLink, setClaimLink] = useState("");

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

    const requirementList = requirements.split("\n").map((item) => item.trim()).filter(Boolean);

    setDrafting(true);
    setMessage("");
    try {
      const response = await fetch("/api/draft-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, companyName, city: location, state: "TX", employmentType: type, payRange: pay, responsibilities: responsibilityList, requirements: requirementList }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not draft this listing.");
      setAiDescription(result.description);
      setFlags(result.flags ?? []);
      const baseRequirements = result.requirementQuestions?.length ? result.requirementQuestions : requirementList;
      setRequirementQuestions([...baseRequirements, ...(result.extractedMustHaves ?? [])]);
      setSuggestedPreferred(result.suggestedPreferred ?? []);
      setSelectedPreferred(new Set());
      setDraft(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not draft this listing.");
    } finally {
      setDrafting(false);
    }
  }

  async function publish() {
    setSubmitting(true);
    setMessage("");
    setClaimLink("");
    const responsibilityList = responsibilities.split("\n").map((item) => item.trim()).filter(Boolean);
    const finalRequirements = [...requirementQuestions.map((item) => item.trim()).filter(Boolean), ...selectedPreferred];
    try {
      const response = await fetch("/api/admin/seed-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          companyName,
          city: location,
          state: "TX",
          payRange: pay,
          employmentType: type,
          category,
          responsibilities: responsibilityList,
          requirements: finalRequirements,
          description: aiDescription,
          contactEmail: contactEmail.trim() || null,
          sourceNote,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not seed this listing.");
      setClaimLink(result.claimLink);
      setMessage(contactEmail.trim() ? "Listing published. Claim link emailed and shown below." : "Listing published. Copy the claim link below to send it yourself.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not seed this listing.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setTitle("");
    setCompanyName("");
    setPay("");
    setLocation("");
    setResponsibilities("");
    setRequirements("");
    setRequirementQuestions([]);
    setSuggestedPreferred([]);
    setSelectedPreferred(new Set());
    setContactEmail("");
    setSourceNote("");
    setDraft(false);
    setAiDescription("");
    setFlags([]);
    setClaimLink("");
    setMessage("");
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link>
        <Link href="/admin" className="text-sm font-bold text-[var(--muted)]">Moderation dashboard <span aria-hidden="true">→</span></Link>
      </header>
      <main className="mx-auto max-w-[1000px] px-6 pb-20 pt-6 lg:px-10">
        <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">US-64 · Founder seeding</p>
        <h1 className="display text-4xl font-bold leading-[1.05] tracking-[-.03em] sm:text-5xl">Seed a listing from a public post.</h1>
        <p className="mt-4 max-w-[650px] text-[var(--muted)]">Rewrite what you read in your own words — never copy-paste the original post&apos;s text. This publishes immediately as <strong>Unclaimed</strong> until the business claims it.</p>

        {claimLink ? (
          <div className="mt-8 rounded-2xl border-2 border-[var(--ink)] bg-white p-6">
            <p className="font-bold">{message}</p>
            <div className="mt-4 rounded-xl bg-[var(--cream)] p-4 text-sm break-all">{claimLink}</div>
            <button onClick={reset} className="mt-5 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white">Seed another listing</button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_.85fr]">
            <form onSubmit={createDraft} className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <div className="space-y-5">
                <label className="block text-sm font-bold">Business name<input required value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
                <label className="block text-sm font-bold">Job title<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-bold">Pay range <span className="text-[var(--coral)]">*</span><input required value={pay} onChange={(event) => setPay(event.target.value)} placeholder="e.g. $18-22/hr" className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
                  <label className="block text-sm font-bold">Employment type<select value={type} onChange={(event) => setType(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 font-normal outline-none">{employmentTypes.map(([label, value]) => <option key={value} value={value}>{label}</option>)}</select></label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-bold">City<input required value={location} onChange={(event) => setLocation(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
                  <label className="block text-sm font-bold">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 font-normal outline-none">{jobCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                </div>
                <label className="block text-sm font-bold">What will they do?<span className="mt-1 block text-xs font-normal text-[var(--muted)]">3-5 responsibilities, in your own words, one per line.</span><textarea required value={responsibilities} onChange={(event) => setResponsibilities(event.target.value)} rows={5} className="mt-2 w-full resize-none rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
                <label className="block text-sm font-bold">Requirements <span className="font-normal text-[var(--muted)]">(optional)</span><span className="mt-1 block text-xs font-normal text-[var(--muted)]">Up to 6, one per line.</span><textarea value={requirements} onChange={(event) => setRequirements(event.target.value)} rows={3} className="mt-2 w-full resize-none rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
                <label className="block text-sm font-bold">Business contact email <span className="font-normal text-[var(--muted)]">(optional)</span><input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="If known -- we'll email the claim link" className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /><span className="mt-1 block text-xs font-normal text-[var(--muted)]">Leave blank to just get a link back to copy into a text message yourself.</span></label>
                <label className="block text-sm font-bold">Source note <span className="font-normal text-[var(--muted)]">(internal only, never shown publicly)</span><input value={sourceNote} onChange={(event) => setSourceNote(event.target.value)} placeholder="e.g. Facebook post, [business] page, 9/7/2026" className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
              </div>
              <button type="submit" disabled={drafting} className="mt-8 w-full rounded-full bg-[var(--coral)] px-6 py-4 font-bold text-white shadow-[0_6px_0_#ce5a4b] disabled:opacity-60">{drafting ? "Drafting..." : "Draft listing"} <span aria-hidden="true">→</span></button>
              {!drafting && message && !draft && <p role="status" className="mt-4 text-sm leading-5 text-[var(--coral)]">{message}</p>}
            </form>
            <aside className="rounded-2xl border border-[var(--line)] bg-[var(--mint)] p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--coral)]">{draft ? "Review before publishing" : "Preview"}</p>
              {draft ? (
                <div className="mt-8">
                  <h2 className="display text-3xl font-bold">{title}</h2>
                  <p className="mt-2 font-semibold">{companyName} · {location}, TX · {type.replace("_", "-")}</p>
                  <p className="mt-1 font-bold text-[var(--coral)]">{pay}</p>
                  {flags.length > 0 && <div className="mt-6 rounded-xl border border-[var(--coral)] bg-white/70 p-4"><p className="text-xs font-bold uppercase tracking-wider text-[var(--coral)]">Review before publishing</p><p className="mt-2 text-sm leading-6">Wording that may be exclusionary or legally risky: {flags.map((flag) => `"${flag}"`).join(", ")}.</p></div>}
                  <div className="mt-8 border-t border-[var(--ink)]/15 pt-5"><p className="text-sm leading-7">{aiDescription}</p></div>
                  {requirementQuestions.length > 0 && <div className="mt-6 border-t border-[var(--ink)]/15 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Requirements</p><p className="mt-1 text-xs text-[var(--ink)]/60">AI rephrased these as questions candidates check off. Edit any of them before publishing.</p><div className="mt-3 space-y-2">{requirementQuestions.map((item, index) => <input key={index} value={item} onChange={(event) => setRequirementQuestions((current) => current.map((q, i) => (i === index ? event.target.value : q)))} className="w-full rounded-lg border border-[var(--ink)]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--coral)]" />)}</div></div>}
                  {suggestedPreferred.length > 0 && <div className="mt-6 border-t border-[var(--ink)]/15 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Suggested by AI — not something you said</p><p className="mt-1 text-xs text-[var(--ink)]/60">Commonly requested for this type of role. Check any you&apos;d like to add — none are included unless you pick them.</p><div className="mt-3 space-y-2">{suggestedPreferred.map((item) => <label key={item} className="flex items-center gap-3 rounded-lg bg-white/70 px-3 py-2 text-sm"><input type="checkbox" checked={selectedPreferred.has(item)} onChange={() => setSelectedPreferred((current) => { const next = new Set(current); if (next.has(item)) next.delete(item); else next.add(item); return next; })} className="h-4 w-4 accent-[var(--coral)]" />{item}</label>)}</div></div>}
                  <button onClick={() => void publish()} disabled={submitting} className="mt-8 w-full rounded-full bg-[var(--ink)] px-6 py-4 font-bold text-white disabled:opacity-60">{submitting ? "Publishing..." : "Publish as Unclaimed"} <span aria-hidden="true">↗</span></button>
                  <button type="button" onClick={() => setDraft(false)} className="mt-3 w-full text-center text-xs font-bold text-[var(--ink)]/70 underline underline-offset-4">Edit details again</button>
                  {message && <p role="status" className="mt-4 text-sm leading-5 text-[var(--muted)]">{message}</p>}
                </div>
              ) : (
                <p className="mt-8 text-sm leading-6 text-[var(--ink)]/70">Fill in the details, then draft the listing to review before it publishes.</p>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
