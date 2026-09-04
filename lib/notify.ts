import "server-only";
import { getResendClient, NOTIFICATIONS_FROM } from "@/lib/resend";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildJobHref } from "@/lib/geo";
import type { Job } from "@/lib/jobs";

const SITE_URL = "https://findjobsnearby.com";

function wrap(preheader: string, bodyHtml: string) {
  return `<div style="font-family:-apple-system,Segoe UI,sans-serif;background:#f8f6f1;padding:32px 16px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <p style="display:none;max-height:0;overflow:hidden;">${preheader}</p>
      <p style="font-weight:700;font-size:20px;color:#152d2a;margin:0 0 24px;">findjobs<span style="color:#ef725d;">nearby</span></p>
      ${bodyHtml}
      <p style="margin-top:32px;font-size:12px;color:#64716d;">FindJobsNearBy · Dallas-Fort Worth, TX</p>
    </div>
  </div>`;
}

async function alreadyNotified(admin: ReturnType<typeof createSupabaseAdminClient>, type: string, recipientId: string, referenceId: string) {
  const { data } = await admin.from("notification_log").select("id").eq("notification_type", type).eq("recipient_account_id", recipientId).eq("reference_id", referenceId).maybeSingle();
  return Boolean(data);
}

async function logNotification(admin: ReturnType<typeof createSupabaseAdminClient>, type: string, recipientId: string, referenceId: string) {
  await admin.from("notification_log").insert({ notification_type: type, recipient_account_id: recipientId, reference_id: referenceId });
}

/** US-22: notify an employer when a candidate applies to their job. */
export async function notifyNewApplication(applicationId: string) {
  const admin = createSupabaseAdminClient();

  const { data: application } = await admin.from("applications").select("id, job_id, candidate_profiles(role_title)").eq("id", applicationId).maybeSingle();
  if (!application) return;

  const { data: job } = await admin.from("jobs").select("id, title, employer_id").eq("id", application.job_id).maybeSingle();
  if (!job) return;

  if (await alreadyNotified(admin, "new_application", job.employer_id, applicationId)) return;

  const { data: employerUser } = await admin.auth.admin.getUserById(job.employer_id);
  const employerEmail = employerUser.user?.email;
  if (!employerEmail) return;

  const roleTitle = (application.candidate_profiles as unknown as { role_title: string }[] | null)?.[0]?.role_title ?? "a candidate";

  await getResendClient().emails.send({
    from: NOTIFICATIONS_FROM,
    to: employerEmail,
    subject: `New application: ${job.title}`,
    html: wrap(
      `${roleTitle} applied to ${job.title}`,
      `<h1 style="font-size:22px;color:#152d2a;margin:0 0 12px;">New applicant for ${job.title}</h1>
       <p style="font-size:15px;line-height:1.6;color:#152d2a;">A candidate applied with a profile titled &ldquo;${roleTitle}.&rdquo; Review their focused profile and decide if they're worth contacting.</p>
       <a href="${SITE_URL}/employer" style="display:inline-block;margin-top:16px;background:#152d2a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:14px;">Review applicant →</a>`,
    ),
  });

  await logNotification(admin, "new_application", job.employer_id, applicationId);
}

/** US-23: notify a candidate when an employer pays to unlock their profile.
 * Not yet called anywhere -- there is no Stripe integration yet, so this
 * event never fires. Wire this into the payment-confirmation handler once
 * paid_profile_views rows are actually created. */
export async function notifyProfileViewed(paidProfileViewId: string) {
  const admin = createSupabaseAdminClient();

  const { data: view } = await admin.from("paid_profile_views").select("id, employer_id, candidate_id").eq("id", paidProfileViewId).maybeSingle();
  if (!view) return;

  if (await alreadyNotified(admin, "profile_viewed", view.candidate_id, paidProfileViewId)) return;

  const { data: candidateUser } = await admin.auth.admin.getUserById(view.candidate_id);
  const candidateEmail = candidateUser.user?.email;
  if (!candidateEmail) return;

  const { data: employerAccount } = await admin.from("accounts").select("display_name").eq("id", view.employer_id).maybeSingle();

  await getResendClient().emails.send({
    from: NOTIFICATIONS_FROM,
    to: candidateEmail,
    subject: "An employer is interested in your profile",
    html: wrap(
      "An employer unlocked your profile",
      `<h1 style="font-size:22px;color:#152d2a;margin:0 0 12px;">Someone&apos;s interested.</h1>
       <p style="font-size:15px;line-height:1.6;color:#152d2a;">${employerAccount?.display_name ?? "A local employer"} just unlocked your full profile and can now message you directly.</p>
       <a href="${SITE_URL}/account" style="display:inline-block;margin-top:16px;background:#152d2a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:14px;">View your applications →</a>`,
    ),
  });

  await logNotification(admin, "profile_viewed", view.candidate_id, paidProfileViewId);
}

/** US-24: notify a candidate that season-appropriate jobs have returned. */
export async function notifySeasonReturn(candidateId: string, jobs: Job[]) {
  const admin = createSupabaseAdminClient();
  const unseen: Job[] = [];
  for (const job of jobs) {
    if (!(await alreadyNotified(admin, "season_return", candidateId, job.id))) unseen.push(job);
  }
  if (unseen.length === 0) return;

  const { data: candidateUser } = await admin.auth.admin.getUserById(candidateId);
  const candidateEmail = candidateUser.user?.email;
  if (!candidateEmail) return;

  const listItems = unseen.map((job) => `<li style="margin-bottom:8px;"><a href="${SITE_URL}${buildJobHref(job.id, job.title, job.city, job.state)}" style="color:#ef725d;font-weight:700;text-decoration:none;">${job.title}</a> — ${job.company}, ${job.city} · ${job.pay}</li>`).join("");

  await getResendClient().emails.send({
    from: NOTIFICATIONS_FROM,
    to: candidateEmail,
    subject: "Season-appropriate jobs just returned",
    html: wrap(
      "New roles matching your seasonal profile",
      `<h1 style="font-size:22px;color:#152d2a;margin:0 0 12px;">It&apos;s that time again.</h1>
       <p style="font-size:15px;line-height:1.6;color:#152d2a;">New roles matching one of your seasonal profiles just went up:</p>
       <ul style="padding-left:18px;font-size:15px;">${listItems}</ul>`,
    ),
  });

  for (const job of unseen) await logNotification(admin, "season_return", candidateId, job.id);
}

/** US-52: digest email for the account-free homepage job-alert signup.
 * Uses job_alert_sent_log for dedup rather than notification_log, since a
 * subscriber has no accounts row to key off of. */
export async function sendJobAlertDigest(subscriber: { id: string; email: string; unsubscribe_token: string }, jobs: Job[]): Promise<boolean> {
  const admin = createSupabaseAdminClient();

  const unseen: Job[] = [];
  for (const job of jobs) {
    const { data } = await admin.from("job_alert_sent_log").select("id").eq("subscriber_id", subscriber.id).eq("job_id", job.id).maybeSingle();
    if (!data) unseen.push(job);
  }
  if (unseen.length === 0) return false;

  const listItems = unseen.map((job) => `<li style="margin-bottom:8px;"><a href="${SITE_URL}${buildJobHref(job.id, job.title, job.city, job.state)}" style="color:#ef725d;font-weight:700;text-decoration:none;">${job.title}</a> — ${job.company}, ${job.city} · ${job.pay}</li>`).join("");
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${subscriber.unsubscribe_token}`;

  await getResendClient().emails.send({
    from: NOTIFICATIONS_FROM,
    to: subscriber.email,
    subject: unseen.length === 1 ? "A new job just went up" : `${unseen.length} new jobs just went up`,
    html: wrap(
      "New jobs on FindJobsNearBy",
      `<h1 style="font-size:22px;color:#152d2a;margin:0 0 12px;">Fresh listings for you.</h1>
       <ul style="padding-left:18px;font-size:15px;">${listItems}</ul>
       <p style="margin-top:24px;font-size:12px;color:#64716d;"><a href="${unsubscribeUrl}" style="color:#64716d;">Unsubscribe from job alerts</a></p>`,
    ),
  });

  for (const job of unseen) await admin.from("job_alert_sent_log").insert({ subscriber_id: subscriber.id, job_id: job.id });
  return true;
}
