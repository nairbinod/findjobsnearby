import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendJobAlertDigest } from "@/lib/notify";
import type { Job } from "@/lib/jobs";

const RECENT_JOB_WINDOW_HOURS = 36;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const since = new Date(Date.now() - RECENT_JOB_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

  const [{ data: subscribers }, { data: recentJobs }] = await Promise.all([
    admin.from("job_alert_subscribers").select("id, email, category, unsubscribe_token").is("unsubscribed_at", null),
    admin.from("jobs").select("id, title, company_name, city, state, category, pay_range, employment_type").eq("status", "published").gte("created_at", since),
  ]);

  if (!subscribers?.length || !recentJobs?.length) {
    return NextResponse.json({ sent: 0 });
  }

  const jobs: Job[] = recentJobs.map((row) => ({
    id: row.id,
    title: row.title,
    company: row.company_name,
    city: row.city,
    state: row.state,
    type: row.employment_type,
    employmentType: row.employment_type,
    pay: row.pay_range,
    category: row.category ?? "Operations",
    postedAt: new Date().toISOString(),
    expiresAt: null,
    description: "",
    responsibilities: [],
    status: "published" as const,
    address: null,
    urgent: false,
    requirements: [],
  }));

  let sent = 0;
  for (const subscriber of subscribers) {
    const matches = subscriber.category ? jobs.filter((job) => job.category === subscriber.category) : jobs;
    if (matches.length === 0) continue;
    if (await sendJobAlertDigest(subscriber, matches)) sent += 1;
  }

  return NextResponse.json({ sent, subscribersChecked: subscribers.length, recentJobs: recentJobs.length });
}
