import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyListingRenewal } from "@/lib/notify";
import type { Job } from "@/lib/jobs";
import { UNCLAIMED_EXPIRY_DAYS } from "@/lib/unclaimed-listings";

// US-31: two related lifecycle steps for a 30-day listing, bundled into one
// route (rather than two crons) to stay within Vercel's cron-count limits.
const REMINDER_WINDOW_DAYS = 5;

// pending_job_submissions/pending_candidate_submissions rows are only ever
// written to (rate-limit check, insert) or read by confirmation_token --
// nothing else ever revisits an abandoned one, so unconfirmed rows past this
// age are swept here rather than accumulating forever.
const PENDING_SUBMISSION_MAX_AGE_DAYS = 7;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const now = new Date();
  const reminderCutoff = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Unclaimed listings have no real employer to remind -- excluded here
  // rather than left to fail inside notifyListingRenewal's Resend call.
  const { data: expiringSoon } = await admin
    .from("jobs")
    .select("id, title, company_name, city, state, category, pay_range, employment_type, employer_id")
    .eq("status", "published")
    .not("employer_id", "is", null)
    .lte("expires_at", reminderCutoff)
    .gt("expires_at", now.toISOString());

  const jobsByEmployer = new Map<string, Job[]>();
  for (const row of expiringSoon ?? []) {
    const job: Job = {
      id: row.id,
      title: row.title,
      company: row.company_name,
      city: row.city,
      state: row.state,
      type: row.employment_type,
      employmentType: row.employment_type,
      pay: row.pay_range,
      category: row.category ?? "Operations",
      postedAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: null,
      description: "",
      responsibilities: [],
      status: "published" as const,
      address: null,
      urgent: false,
      requirements: [],
      unclaimed: false,
    };
    jobsByEmployer.set(row.employer_id, [...(jobsByEmployer.get(row.employer_id) ?? []), job]);
  }
  for (const [employerId, jobs] of jobsByEmployer) await notifyListingRenewal(employerId, jobs);

  const { data: expired } = await admin
    .from("jobs")
    .update({ status: "expired" })
    .eq("status", "published")
    .lte("expires_at", now.toISOString())
    .select("id");

  // US-69: a seeded listing nobody has verified auto-expires sooner than the
  // standard 30-day window, regardless of its own expires_at.
  const unclaimedCutoff = new Date(now.getTime() - UNCLAIMED_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: unclaimedExpired } = await admin
    .from("jobs")
    .update({ status: "expired" })
    .eq("status", "published")
    .is("employer_id", null)
    .lte("created_at", unclaimedCutoff)
    .select("id");

  const pendingCutoff = new Date(now.getTime() - PENDING_SUBMISSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: expiredJobSubmissions } = await admin
    .from("pending_job_submissions")
    .delete()
    .is("confirmed_at", null)
    .lte("created_at", pendingCutoff)
    .select("id");
  const { data: expiredCandidateSubmissions } = await admin
    .from("pending_candidate_submissions")
    .delete()
    .is("confirmed_at", null)
    .lte("created_at", pendingCutoff)
    .select("id");

  return NextResponse.json({
    remindersSent: jobsByEmployer.size,
    listingsExpired: expired?.length ?? 0,
    unclaimedExpired: unclaimedExpired?.length ?? 0,
    pendingSubmissionsSwept: (expiredJobSubmissions?.length ?? 0) + (expiredCandidateSubmissions?.length ?? 0),
  });
}
