"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Message = { id: string; sender_id: string; body: string; created_at: string };

type MessageThreadProps = { employerId: string; candidateId: string; viewerId: string; counterpartLabel: string };

/** US-18: open messaging between an employer and a candidate once the
 * employer has paid to unlock the profile (US-16). RLS enforces the unlock
 * gate on insert -- this component only reflects that state, it doesn't
 * decide it. Used from both the employer dashboard and the candidate's
 * account page, keyed by the same (employerId, candidateId) pair either way. */
export default function MessageThread({ employerId, candidateId, viewerId, counterpartLabel }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data, error: loadError } = await supabase
        .from("messages")
        .select("id, sender_id, body, created_at")
        .eq("employer_id", employerId)
        .eq("candidate_id", candidateId)
        .order("created_at", { ascending: true });
      if (loadError) setError(loadError.message);
      setMessages(data ?? []);
      setLoading(false);
    }
    void load();
  }, [employerId, candidateId]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { data, error: sendError } = await supabase
      .from("messages")
      .insert({ employer_id: employerId, candidate_id: candidateId, sender_id: viewerId, body: text })
      .select("id, sender_id, body, created_at")
      .single();
    if (sendError || !data) {
      setError(sendError?.message ?? "Could not send that message.");
    } else {
      setMessages((current) => [...current, data]);
      setBody("");
      void fetch("/api/notify/new-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: data.id }),
      });
    }
    setSending(false);
  }

  return (
    <div className="mt-4 rounded-lg bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Message {counterpartLabel}</p>
      <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
        {loading ? (
          <p className="text-xs text-[var(--muted)]">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-[var(--muted)]">No messages yet — say hello.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-5 ${message.sender_id === viewerId ? "ml-auto bg-[var(--mint)] text-[var(--ink)]" : "bg-[var(--cream)] text-[var(--ink)]"}`}>
              <p>{message.body}</p>
              <p className="mt-1 text-[10px] text-[var(--muted)]">{new Date(message.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a message..." className="flex-1 rounded-full border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--coral)]" />
        <button disabled={sending || !body.trim()} className="rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-bold text-white disabled:opacity-60">{sending ? "Sending..." : "Send"}</button>
      </form>
      {error && <p role="status" className="mt-2 text-xs text-[var(--coral)]">{error}</p>}
    </div>
  );
}
