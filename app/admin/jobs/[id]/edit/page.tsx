import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import EditJobForm from "@/app/employer/jobs/[id]/edit/EditJobForm";

type AdminEditJobPageProps = { params: Promise<{ id: string }> };

/** US-79: reuses the employer edit form (same AI drafting/must-have
 * extraction as US-3/US-62) but fetches by id alone, not employer_id --
 * admin needs to edit any job, including unclaimed ones (employer_id is
 * null, so the employer page's ownership-scoped fetch would never find
 * them). The save call itself is unchanged: it only ever touches content
 * fields, never employer_id or claim_token, so editing never affects a
 * listing's claimed/unclaimed state or its existing claim link. */
export default async function AdminEditJobPage({ params }: AdminEditJobPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/employer/auth");

  const { data: account } = await supabase.from("accounts").select("role").eq("id", userData.user.id).maybeSingle();
  if (account?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[var(--cream)]">
        <main className="mx-auto max-w-[600px] px-6 py-20 text-center">
          <h1 className="display text-4xl font-bold">Admin access only</h1>
          <p className="mt-4 text-[var(--muted)]">Sign in with an admin account to edit this listing.</p>
          <Link href="/employer/auth" className="mt-6 inline-block rounded-full bg-[var(--coral)] px-6 py-3 text-sm font-bold text-white">Sign in <span aria-hidden="true">→</span></Link>
        </main>
      </div>
    );
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, company_name, city, address, urgent, pay_range, employment_type, category, responsibilities, requirements, status, seed_contact_email, seed_source_note")
    .eq("id", id)
    .maybeSingle();

  if (!job) notFound();

  return <EditJobForm job={job} backHref="/admin" backLabel="Back to admin dashboard" ownerErrorMessage="Could not save -- this listing may have been removed." showSeedFields />;
}
