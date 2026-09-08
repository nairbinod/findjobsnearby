"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type JobAlertSubscriber = { id: string; email: string; category: string | null; unsubscribed_at: string | null; created_at: string };
type NewsletterSubscriber = { id: string; email: string; unsubscribed_at: string | null; created_at: string };

/** Admin visibility into both subscriber lists (US-52 job alerts, US-49
 * newsletter) -- neither ever had any RLS policy at all before this, so
 * there was previously no way to see who's subscribed without a direct
 * database connection. */
export default function AdminSubscribersPanel() {
  const [tab, setTab] = useState<"jobAlerts" | "newsletter">("jobAlerts");
  const [jobAlertSubscribers, setJobAlertSubscribers] = useState<JobAlertSubscriber[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    Promise.all([
      supabase.from("job_alert_subscribers").select("id, email, category, unsubscribed_at, created_at").order("created_at", { ascending: false }),
      supabase.from("newsletter_subscribers").select("id, email, unsubscribed_at, created_at").order("created_at", { ascending: false }),
    ]).then(([jobAlerts, newsletter]) => {
      if (jobAlerts.error || newsletter.error) setMessage(jobAlerts.error?.message ?? newsletter.error?.message ?? "Could not load subscribers.");
      setJobAlertSubscribers(jobAlerts.data ?? []);
      setNewsletterSubscribers(newsletter.data ?? []);
      setLoading(false);
    });
  }, []);

  const activeJobAlerts = jobAlertSubscribers.filter((subscriber) => !subscriber.unsubscribed_at);
  const activeNewsletter = newsletterSubscribers.filter((subscriber) => !subscriber.unsubscribed_at);

  return (
    <section>
      <h2 className="text-xl font-bold">Subscribers</h2>
      <div className="mt-4 flex gap-3 text-sm font-bold">
        <button onClick={() => setTab("jobAlerts")} className={tab === "jobAlerts" ? "text-[var(--coral)]" : "text-[var(--muted)]"}>Job alerts ({activeJobAlerts.length})</button>
        <button onClick={() => setTab("newsletter")} className={tab === "newsletter" ? "text-[var(--coral)]" : "text-[var(--muted)]"}>Newsletter ({activeNewsletter.length})</button>
      </div>
      {message && <p className="mt-3 text-sm font-semibold text-[var(--coral)]">{message}</p>}
      {loading ? (
        <p className="mt-4 text-sm text-[var(--muted)]">Loading...</p>
      ) : tab === "jobAlerts" ? (
        jobAlertSubscribers.length === 0 ? <p className="mt-4 text-sm text-[var(--muted)]">No job alert subscribers yet.</p> : (
          <div className="mt-4 space-y-2">
            {jobAlertSubscribers.map((subscriber) => (
              <div key={subscriber.id} className={`flex items-center justify-between rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm ${subscriber.unsubscribed_at ? "opacity-60" : ""}`}>
                <span>{subscriber.email} <span className="text-[var(--muted)]">· {subscriber.category ?? "All categories"}</span></span>
                <span className="text-xs text-[var(--muted)]">{subscriber.unsubscribed_at ? "Unsubscribed" : `Subscribed ${new Date(subscriber.created_at).toLocaleDateString()}`}</span>
              </div>
            ))}
          </div>
        )
      ) : (
        newsletterSubscribers.length === 0 ? <p className="mt-4 text-sm text-[var(--muted)]">No newsletter subscribers yet.</p> : (
          <div className="mt-4 space-y-2">
            {newsletterSubscribers.map((subscriber) => (
              <div key={subscriber.id} className={`flex items-center justify-between rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm ${subscriber.unsubscribed_at ? "opacity-60" : ""}`}>
                <span>{subscriber.email}</span>
                <span className="text-xs text-[var(--muted)]">{subscriber.unsubscribed_at ? "Unsubscribed" : `Subscribed ${new Date(subscriber.created_at).toLocaleDateString()}`}</span>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  );
}
