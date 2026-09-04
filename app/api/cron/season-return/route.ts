import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifySeasonReturn } from "@/lib/notify";
import type { Job } from "@/lib/jobs";

const RECENT_JOB_WINDOW_HOURS = 36;

/** Recurring annual window check, month/day only (year ignored) so a profile
 * from a prior year still matches this year's season. Handles windows that
 * cross the year boundary (e.g. Nov 15 - Jan 5). */
function isInSeason(from: string, until: string, today: Date) {
  const toMonthDay = (iso: string) => {
    const d = new Date(iso);
    return d.getUTCMonth() * 100 + d.getUTCDate();
  };
  const fromMD = toMonthDay(from);
  const untilMD = toMonthDay(until);
  const todayMD = today.getUTCMonth() * 100 + today.getUTCDate();
  if (fromMD <= untilMD) return todayMD >= fromMD && todayMD <= untilMD;
  return todayMD >= fromMD || todayMD <= untilMD;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const now = new Date();
  const since = new Date(now.getTime() - RECENT_JOB_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

  const [{ data: profiles }, { data: recentJobs }] = await Promise.all([
    admin.from("candidate_profiles").select("candidate_id, category, available_from, available_until").not("approved_at", "is", null).not("available_from", "is", null).not("available_until", "is", null),
    admin.from("jobs").select("id, title, company_name, city, state, category, pay_range, employment_type").eq("status", "published").gte("created_at", since),
  ]);

  if (!profiles?.length || !recentJobs?.length) {
    return NextResponse.json({ matched: 0 });
  }

  const jobsByCategory = new Map<string, Job[]>();
  for (const row of recentJobs) {
    if (!row.category) continue;
    const job: Job = {
      id: row.id,
      title: row.title,
      company: row.company_name,
      city: row.city,
      state: row.state,
      type: row.employment_type,
      employmentType: row.employment_type,
      pay: row.pay_range,
      category: row.category,
      postedAt: now.toISOString(),
      expiresAt: null,
      description: "",
      responsibilities: [],
      status: "published" as const,
    };
    jobsByCategory.set(row.category, [...(jobsByCategory.get(row.category) ?? []), job]);
  }

  let matched = 0;
  for (const profile of profiles) {
    if (!profile.available_from || !profile.available_until) continue;
    if (!isInSeason(profile.available_from, profile.available_until, now)) continue;
    const matches = jobsByCategory.get(profile.category ?? "");
    if (!matches?.length) continue;
    await notifySeasonReturn(profile.candidate_id, matches);
    matched += matches.length;
  }

  return NextResponse.json({ matched, candidatesChecked: profiles.length, recentJobs: recentJobs.length });
}
