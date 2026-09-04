import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jobs as demoJobs, type Job } from "@/lib/jobs";
import { buildJobHref } from "@/lib/geo";

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMPLOYMENT_TYPE_LABEL: Record<Job["employmentType"], string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  seasonal: "Seasonal",
};

type DbJobRow = {
  id: string;
  title: string;
  company_name: string;
  city: string;
  state: string;
  employment_type: Job["employmentType"];
  pay_range: string;
  category: string | null;
  description: string | null;
  responsibilities: string[] | null;
  created_at: string;
  expires_at: string | null;
  status: "published" | "closed";
  address: string | null;
  urgent: boolean;
};

function fromDbRow(row: DbJobRow): Job {
  return {
    id: row.id,
    title: row.title,
    company: row.company_name,
    city: row.city,
    state: row.state,
    type: EMPLOYMENT_TYPE_LABEL[row.employment_type],
    employmentType: row.employment_type,
    pay: row.pay_range,
    category: row.category ?? "Operations",
    postedAt: row.created_at,
    expiresAt: row.expires_at,
    description: row.description ?? "A local opportunity from a nearby business.",
    responsibilities: row.responsibilities ?? [],
    status: row.status,
    address: row.address,
    urgent: row.urgent,
  };
}

/** Server-only: merges the curated demo listings with published jobs from
 * Supabase so public pages have real content on day one and keep working
 * as employers publish their own. */
export async function getAllJobs(): Promise<Job[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("jobs")
    .select("id, title, company_name, city, state, employment_type, pay_range, category, description, responsibilities, created_at, expires_at, status, address, urgent")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const dbJobs = (data ?? []).map((row) => fromDbRow(row as DbJobRow));
  return [...dbJobs, ...demoJobs].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}

export async function getJobBySlug(slug: string): Promise<Job | undefined> {
  const demoMatch = demoJobs.find((job) => job.id === slug);
  if (demoMatch) return demoMatch;

  const idMatch = slug.match(UUID_RE);
  if (!idMatch) return undefined;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("jobs")
    .select("id, title, company_name, city, state, employment_type, pay_range, category, description, responsibilities, created_at, expires_at, status, address, urgent")
    .eq("id", idMatch[0])
    .in("status", ["published", "closed"])
    .maybeSingle();

  return data ? fromDbRow(data as DbJobRow) : undefined;
}

export function jobHref(job: Job) {
  return buildJobHref(job.id, job.title, job.city, job.state);
}
