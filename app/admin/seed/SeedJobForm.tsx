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

export default function SeedJobForm() {
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [pay, setPay] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("full_time");
  const [category, setCategory] = useState<string>(jobCategories[0]);
  const [responsibilities, setResponsibilities] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [claimLink, setClaimLink] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const responsibilityList = responsibilities.split("\n").map((item) => item.trim()).filter(Boolean);
    if (responsibilityList.length < 3 || responsibilityList.length > 5) {
      setMessage("Add 3 to 5 responsibilities, with one responsibility on each line.");
      return;
    }
    if (containsContactInfo(title) || containsContactInfo(companyName) || containsContactInfo(responsibilities) || containsContactInfo(description)) {
      setMessage(CONTACT_INFO_MESSAGE);
      return;
    }

    setSubmitting(true);
    setMessage("");
    setClaimLink("");
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
          description,
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
    setDescription("");
    setContactEmail("");
    setSourceNote("");
    setClaimLink("");
    setMessage("");
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <header className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="display text-[25px] font-bold tracking-[-.04em]">findjobs<span className="text-[var(--coral)]">nearby</span><sup className="ml-0.5 text-[10px]">®</sup></Link>
        <Link href="/admin" className="text-sm font-bold text-[var(--muted)]">Moderation dashboard <span aria-hidden="true">→</span></Link>
      </header>
      <main className="mx-auto max-w-[900px] px-6 pb-20 pt-6 lg:px-10">
        <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">US-64 · Founder seeding</p>
        <h1 className="display text-4xl font-bold leading-[1.05] tracking-[-.03em] sm:text-5xl">Seed a listing from a public post.</h1>
        <p className="mt-4 max-w-[600px] text-[var(--muted)]">Rewrite what you read in your own words — never copy-paste the original post&apos;s text. This publishes immediately as <strong>Unclaimed</strong> until the business claims it.</p>

        {claimLink ? (
          <div className="mt-8 rounded-2xl border-2 border-[var(--ink)] bg-white p-6">
            <p className="font-bold">{message}</p>
            <div className="mt-4 rounded-xl bg-[var(--cream)] p-4 text-sm break-all">{claimLink}</div>
            <button onClick={reset} className="mt-5 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white">Seed another listing</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
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
            <label className="block text-sm font-bold">Description<span className="mt-1 block text-xs font-normal text-[var(--muted)]">A couple sentences, rewritten in your own words -- never the original post&apos;s text.</span><textarea required value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-2 w-full resize-none rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
            <label className="block text-sm font-bold">Business contact email <span className="font-normal text-[var(--muted)]">(optional)</span><input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="If known -- we'll email the claim link" className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /><span className="mt-1 block text-xs font-normal text-[var(--muted)]">Leave blank to just get a link back to copy into a text message yourself.</span></label>
            <label className="block text-sm font-bold">Source note <span className="font-normal text-[var(--muted)]">(internal only, never shown publicly)</span><input value={sourceNote} onChange={(event) => setSourceNote(event.target.value)} placeholder="e.g. Facebook post, [business] page, 9/7/2026" className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none focus:border-[var(--coral)]" /></label>
            <button type="submit" disabled={submitting} className="w-full rounded-full bg-[var(--coral)] px-6 py-4 font-bold text-white shadow-[0_6px_0_#ce5a4b] disabled:opacity-60">{submitting ? "Publishing..." : "Publish as Unclaimed"} <span aria-hidden="true">→</span></button>
            {message && <p role="status" className="text-sm leading-5 text-[var(--coral)]">{message}</p>}
          </form>
        )}
      </main>
    </div>
  );
}
