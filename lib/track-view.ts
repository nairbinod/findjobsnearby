import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** US-21a: records a unique job view. "Unique" is approximated from the
 * requester's IP (shared IPs/NAT can undercount, but that's an acceptable
 * trade-off for a free Phase-1 count rather than a full analytics stack). */
export async function recordJobView(jobId: string) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerList.get("x-real-ip") ?? "unknown";
  const visitorHash = createHash("sha256").update(`${jobId}:${ip}`).digest("hex");

  const supabase = await createSupabaseServerClient();
  await supabase.from("job_views").upsert({ job_id: jobId, visitor_hash: visitorHash }, { onConflict: "job_id,visitor_hash", ignoreDuplicates: true });
}
