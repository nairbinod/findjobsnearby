"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { buildJobHref } from "@/lib/geo";
import { containsContactInfo, CONTACT_INFO_MESSAGE } from "@/lib/contact-guard";
import AuthNav from "@/components/AuthNav";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const employmentTypes = [
  ["Full-time", "full_time"],
  ["Part-time", "part_time"],
  ["Contract", "contract"],
  ["Seasonal", "seasonal"],
] as const;

const jobCategories = ["Food & hospitality", "Skilled trades", "Care & education", "Operations"] as const;

export default function PostForm({ initialError = "" }: { initialError?: string }) {
  const [draft, setDraft] = useState(false);
  const [published, setPublished] = useState(false);
  // US-70: an anonymous visitor can still draft and submit a listing --
  // isSignedIn gates whether publishing happens instantly (existing
  // behavior) or goes through the email-confirm path. null = still checking.
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [pay, setPay] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [type, setType] = useState("full_time");
  const [category, setCategory] = useState<string>(jobCategories[0]);
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [requirementQuestions, setRequirementQuestions] = useState<string[]>([]);
  // US-63: AI-suggested "preferred" items -- generic for this role type, not
  // grounded in what the employer wrote, so they must default unchecked and
  // require individual opt-in. Never merged into requirementQuestions directly.
  const [suggestedPreferred, setSuggestedPreferred] = useState<string[]>([]);
  const [selectedPreferred, setSelectedPreferred] = useState<Set<string>>(new Set());
  const [publishMessage, setPublishMessage] = useState(initialError);
  const [publishing, setPublishing] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [flags, setFlags] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setIsSignedIn(Boolean(data.user)));
  }, []);
  const [postedRoles, setPostedRoles] = useState<{ id: string; title: string; city: string; state: string }[]>([]);

  async function createDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const responsibilityList = responsibilities.split("\n").map((item) => item.trim()).filter(Boolean);
    if (responsibilityList.length < 3 || responsibilityList.length > 5) {
      setPublishMessage("Add 3 to 5 responsibilities, with one responsibility on each line.");
      return;
    }
    if (requirements.split("\n").map((item) => item.trim()).filter(Boolean).length > 6) {
      setPublishMessage("Add up to 6 requirements, with one requirement on each line.");
      return;
    }
    if (containsContactInfo(title) || containsContactInfo(companyName) || containsContactInfo(responsibilities) || containsContactInfo(requirements)) {
      setPublishMessage(CONTACT_INFO_MESSAGE);
      return;
    }

    const requirementList = requirements.split("\n").map((item) => item.trim()).filter(Boolean);

    setDrafting(true);
    setPublishMessage("");
    try {
      const response = await fetch("/api/draft-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, companyName, city: location, state: "TX", employmentType: type, payRange: pay, responsibilities: responsibilityList, requirements: requirementList }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not draft the listing.");
      setAiDescription(result.description);
      setFlags(result.flags ?? []);
      // AI rephrases each requirement as a question, but the employer still
      // reviews and can edit every one before it saves (§5 human-approval).
      // US-62: must-haves extracted from the employer's own responsibilities/
      // description text are folded in here too, checked by default since
      // they're the employer's own words -- same editable treatment as the
      // manually-typed ones, not a separate confirmation step.
      const baseRequirements = result.requirementQuestions?.length ? result.requirementQuestions : requirementList;
      setRequirementQuestions([...baseRequirements, ...(result.extractedMustHaves ?? [])]);
      setSuggestedPreferred(result.suggestedPreferred ?? []);
      setSelectedPreferred(new Set());
      setDraft(true);
      setPublished(false);
    } catch (error) {
      setPublishMessage(error instanceof Error ? error.message : "Could not draft the listing.");
    } finally {
      setDrafting(false);
    }
  }

  function addAnotherRole() {
    setTitle("");
    setPay("");
    setAddress("");
    setUrgent(false);
    setResponsibilities("");
    setRequirements("");
    setRequirementQuestions([]);
    setSuggestedPreferred([]);
    setSelectedPreferred(new Set());
    setAiDescription("");
    setFlags([]);
    setDraft(false);
    setPublished(false);
    setPendingConfirmation(false);
    setPublishMessage("");
  }

  async function publishJob() {
    setPublishing(true);
    setPublishMessage("");

    const responsibilityList = responsibilities.split("\n").map((item) => item.trim()).filter(Boolean);
    if (responsibilityList.length < 3 || responsibilityList.length > 5) {
      setPublishMessage("Add 3 to 5 responsibilities, with one responsibility on each line.");
      setPublishing(false);
      return;
    }
    const finalRequirements = [...requirementQuestions.map((item) => item.trim()).filter(Boolean), ...selectedPreferred];
    if (finalRequirements.length > 6) {
      setPublishMessage("You have more than 6 requirements total — remove some or uncheck a suggested one.");
      setPublishing(false);
      return;
    }
    if (containsContactInfo(title) || containsContactInfo(companyName) || containsContactInfo(responsibilities) || containsContactInfo(finalRequirements.join("\n"))) {
      setPublishMessage(CONTACT_INFO_MESSAGE);
      setPublishing(false);
      return;
    }

    // US-70: no session yet -- draft and submit with just an email, publish
    // happens once they confirm it, instead of requiring sign-in up front.
    if (!isSignedIn) {
      if (!EMAIL_RE.test(email.trim())) {
        setPublishMessage("Enter a valid email address to receive your confirmation link.");
        setPublishing(false);
        return;
      }
      try {
        const response = await fetch("/api/post-job/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            title,
            companyName,
            city: location,
            state: "TX",
            address: address.trim() || null,
            urgent,
            payRange: pay,
            employmentType: type,
            category,
            responsibilities: responsibilityList,
            requirements: finalRequirements,
            description: aiDescription || responsibilityList.join(" "),
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Could not save your listing.");
        setPendingConfirmation(true);
      } catch (error) {
        setPublishMessage(error instanceof Error ? error.message : "Could not save your listing.");
      } finally {
        setPublishing(false);
      }
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setPublishMessage("Sign in with an employer account before publishing this listing.");
      setPublishing(false);
      return;
    }

    const { data, error } = await supabase.from("jobs").insert({
      employer_id: userData.user.id,
      title,
      company_name: companyName,
      city: location,
      state: "TX",
      address: address.trim() || null,
      urgent,
      pay_range: pay,
      employment_type: type,
      category,
      responsibilities: responsibilityList,
      requirements: finalRequirements.length > 0 ? finalRequirements : null,
      description: aiDescription || responsibilityList.join(" "),
      status: "published",
      ai_assisted: true,
      approved_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).select("id").single();

    setPublishMessage(error ? error.message : "Your listing is live.");
    if (!error && data) {
      setPublished(true);
      setPostedRoles((roles) => [...roles, { id: data.id, title, city: location, state: "TX" }]);
    }
    setPublishing(false);
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-6 lg:px-10">
        <a href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></a>
        <div className="flex items-center gap-5"><AuthNav defaultAuthHref="/employer/auth" /><a href="/jobs" className="text-sm font-bold text-[var(--muted)]">Browse jobs <span aria-hidden="true">→</span></a></div>
      </header>
      <main className="mx-auto max-w-[1000px] px-6 pb-20 pt-12 lg:px-10">
        <div className="mb-12 max-w-[650px]"><p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">Free employer posting</p><h1 className="display text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-7xl">Tell us who<br />you&apos;re looking for.</h1><p className="mt-6 text-lg leading-7 text-[var(--muted)]">A few details in. A clear job listing out. You&apos;ll review everything before it goes live.</p></div>
        {postedRoles.length > 0 && <div className="mb-8 rounded-2xl border border-[var(--line)] bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Posted this session ({postedRoles.length})</p><ul className="mt-3 flex flex-wrap gap-2">{postedRoles.map((role) => <li key={role.id}><Link href={buildJobHref(role.id, role.title, role.city, role.state)} className="rounded-full bg-[var(--cream)] px-3 py-1.5 text-xs font-bold text-[var(--ink)] hover:bg-[var(--mint)]">{role.title} ↗</Link></li>)}</ul></div>}
        <div className="grid gap-8 lg:grid-cols-[1fr_.85fr]">
          <form onSubmit={createDraft} className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex items-center gap-3 text-sm font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ink)] text-white">1</span><span>Role details</span><span className="h-px flex-1 bg-[var(--line)]" /><span className="text-[var(--muted)]">Free to post</span></div>
            <div className="space-y-5">
              <label className="block text-sm font-bold">Business name<input required value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="e.g. Oak & Ember Kitchen" className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
              <label className="block text-sm font-bold">Job title<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Front desk coordinator" className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
              <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-bold">Pay range <span className="text-[var(--coral)]">*</span><input required value={pay} onChange={(event) => setPay(event.target.value)} placeholder="e.g. $18-22/hr" className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label><label className="block text-sm font-bold">Employment type<select value={type} onChange={(event) => setType(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 font-normal outline-none">{employmentTypes.map(([label, value]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
              <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-bold">City<input required value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Dallas" className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label><label className="block text-sm font-bold">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 font-normal outline-none">{jobCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div>
              <label className="block text-sm font-bold">Street address <span className="font-normal text-[var(--muted)]">(optional)</span><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="e.g. 412 Magnolia Ave" className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /><span className="mt-1 block text-xs font-normal text-[var(--muted)]">Shown on the listing so candidates know exactly where to go. Leave blank to only show the city.</span></label>
              <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={urgent} onChange={(event) => setUrgent(event.target.checked)} className="h-5 w-5 rounded border-[var(--line)] accent-[var(--coral)]" />Mark as Urgently Hiring<span className="font-normal text-[var(--muted)]">— adds a badge to your listing</span></label>
              <label className="block text-sm font-bold">What will they do?<span className="mt-1 block text-xs font-normal text-[var(--muted)]">Add 3-5 responsibilities. One per line. {responsibilities.split("\n").map((item) => item.trim()).filter(Boolean).length}/5</span><textarea required value={responsibilities} onChange={(event) => setResponsibilities(event.target.value)} rows={5} placeholder="Prepare daily orders\nHelp customers at the counter\nKeep the workspace organized" className="mt-2 w-full resize-none rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
              <label className="block text-sm font-bold">Requirements <span className="font-normal text-[var(--muted)]">(optional)</span><span className="mt-1 block text-xs font-normal text-[var(--muted)]">Add up to 6, one per line — candidates check off which they meet before applying. {requirements.split("\n").map((item) => item.trim()).filter(Boolean).length}/6</span><textarea value={requirements} onChange={(event) => setRequirements(event.target.value)} rows={3} placeholder="Reliable transportation\nAvailable weekends\n2+ years experience" className="mt-2 w-full resize-none rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
            </div>
            <button type="submit" disabled={drafting} className="mt-8 w-full rounded-full bg-[var(--coral)] px-6 py-4 font-bold text-white shadow-[0_6px_0_#ce5a4b] disabled:opacity-60">{drafting ? "Drafting with AI..." : "Draft my listing"} <span aria-hidden="true">→</span></button>
            {drafting && publishMessage === "" && <p className="mt-4 text-center text-xs text-[var(--muted)]">Formatting your listing — this only uses what you typed above.</p>}
            {!drafting && publishMessage && !draft && <p role="status" className="mt-4 text-sm leading-5 text-[var(--coral)]">{publishMessage}</p>}
          </form>
          <aside className="rounded-2xl border border-[var(--line)] bg-[var(--mint)] p-6 sm:p-8">
            <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--coral)]">{published ? "Published" : draft ? "Review before publishing" : "Your listing preview"}</p><span className="text-xl">✳</span></div>
            {published ? <div className="mt-10 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--yellow)] text-2xl">✓</div><h2 className="display mt-6 text-3xl font-bold">You&apos;re live.</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Your listing is ready for local job seekers to discover.</p><button onClick={addAnotherRole} className="mt-7 w-full rounded-full bg-[var(--ink)] px-6 py-4 font-bold text-white">Add another role <span aria-hidden="true">+</span></button><p className="mt-3 text-xs text-[var(--muted)]">Hiring for more than one position? Post each role separately — free every time.</p></div> : pendingConfirmation ? <div className="mt-10 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--yellow)] text-2xl">✉</div><h2 className="display mt-6 text-3xl font-bold">Almost there.</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Your listing has been created. Check <strong>{email}</strong> and click the confirmation link to publish it and start receiving applicants.</p></div> : draft ? <div className="mt-10">{urgent && <span className="mb-3 inline-block rounded-full bg-[var(--coral)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Urgently hiring</span>}<h2 className="display text-4xl font-bold">{title}</h2><p className="mt-2 font-semibold">{companyName} · {address ? `${address}, ${location}` : location} · {type.replace("_", "-")}</p><p className="mt-1 font-bold text-[var(--coral)]">{pay}</p>{flags.length > 0 && <div className="mt-6 rounded-xl border border-[var(--coral)] bg-white/70 p-4"><p className="text-xs font-bold uppercase tracking-wider text-[var(--coral)]">Review before publishing</p><p className="mt-2 text-sm leading-6">Your listing includes wording that may be exclusionary or legally risky: {flags.map((flag) => `"${flag}"`).join(", ")}. Edit it above if you&apos;d like, then draft again.</p></div>}<div className="mt-8 border-t border-[var(--ink)]/15 pt-5"><p className="text-sm leading-7">{aiDescription}</p></div><div className="mt-6 space-y-1 text-sm leading-7 text-[var(--ink)]/70">{responsibilities.split("\n").filter(Boolean).map((item) => <span className="block" key={item}>• {item}</span>)}</div>{requirementQuestions.length > 0 && <div className="mt-6 border-t border-[var(--ink)]/15 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Requirements</p><p className="mt-1 text-xs text-[var(--ink)]/60">AI rephrased these as questions candidates check off. Edit any of them before publishing.</p><div className="mt-3 space-y-2">{requirementQuestions.map((item, index) => <input key={index} value={item} onChange={(event) => setRequirementQuestions((current) => current.map((q, i) => (i === index ? event.target.value : q)))} className="w-full rounded-lg border border-[var(--ink)]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--coral)]" />)}</div></div>}
                {suggestedPreferred.length > 0 && <div className="mt-6 border-t border-[var(--ink)]/15 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Suggested by AI — not something you said</p><p className="mt-1 text-xs text-[var(--ink)]/60">Commonly requested for this type of role. Check any you&apos;d like to add — none are included unless you pick them.</p><div className="mt-3 space-y-2">{suggestedPreferred.map((item) => <label key={item} className="flex items-center gap-3 rounded-lg bg-white/70 px-3 py-2 text-sm"><input type="checkbox" checked={selectedPreferred.has(item)} onChange={() => setSelectedPreferred((current) => { const next = new Set(current); if (next.has(item)) next.delete(item); else next.add(item); return next; })} className="h-4 w-4 accent-[var(--coral)]" />{item}</label>)}</div></div>}<p className="mt-8 text-xs leading-5 text-[var(--muted)]">AI-assisted draft. Only the details you provided are included. Nothing publishes until you approve it.</p>{isSignedIn === false && <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-[var(--ink)]/60">Your email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@yourbusiness.com" className="mt-2 w-full rounded-lg border border-[var(--ink)]/15 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--coral)]" /><span className="mt-1 block text-xs font-normal normal-case tracking-normal text-[var(--ink)]/60">We&apos;ll send a link to confirm and publish this listing — no password needed.</span></label>}<button onClick={publishJob} disabled={publishing || isSignedIn === null} className="mt-6 w-full rounded-full bg-[var(--ink)] px-6 py-4 font-bold text-white disabled:opacity-60">{publishing ? "Publishing..." : isSignedIn === false ? "Send confirmation email" : "Approve & publish"} <span aria-hidden="true">↗</span></button>{publishMessage && <p role="status" className="mt-4 text-sm leading-5 text-[var(--muted)]">{publishMessage}</p>}</div> : <div className="mt-12"><div className="h-4 w-24 rounded bg-white/70" /><div className="mt-5 h-10 w-4/5 rounded bg-white/70" /><div className="mt-3 h-4 w-2/5 rounded bg-white/70" /><div className="mt-10 space-y-3 border-t border-[var(--ink)]/10 pt-6"><div className="h-3 w-full rounded bg-white/60" /><div className="h-3 w-11/12 rounded bg-white/60" /><div className="h-3 w-4/5 rounded bg-white/60" /></div><p className="mt-12 text-sm leading-6 text-[var(--muted)]">Your approved listing will be clear, grounded in your words, and ready to share with nearby candidates.</p></div>}
          </aside>
        </div>
      </main>
    </div>
  );
}
