import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import EditJobForm from "./EditJobForm";

type EditJobPageProps = { params: Promise<{ id: string }> };

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/auth");

  // .eq("employer_id", ...) here is defense in depth on top of RLS --
  // "Employers manage their own jobs" already scopes this, but an explicit
  // check keeps the ownership rule visible at the call site.
  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, company_name, city, address, urgent, pay_range, employment_type, category, responsibilities, status")
    .eq("id", id)
    .eq("employer_id", userData.user.id)
    .maybeSingle();

  if (!job) notFound();

  return <EditJobForm job={job} />;
}
