import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id: candidateId } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const employerId = userData.user.id;

  const admin = createSupabaseAdminClient();

  const { data: unlock } = await admin
    .from("paid_profile_views")
    .select("id")
    .eq("employer_id", employerId)
    .eq("candidate_id", candidateId)
    .maybeSingle();
  if (!unlock) {
    return NextResponse.json({ error: "This profile hasn't been unlocked." }, { status: 403 });
  }

  const [{ data: privateProfile }, { data: candidateUser }, { data: account }] = await Promise.all([
    admin.from("candidate_profile_private").select("work_history, desired_pay").eq("candidate_id", candidateId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.auth.admin.getUserById(candidateId),
    admin.from("accounts").select("phone").eq("id", candidateId).maybeSingle(),
  ]);

  return NextResponse.json({
    workHistory: privateProfile?.work_history ?? null,
    desiredPay: privateProfile?.desired_pay ?? null,
    email: candidateUser.user?.email ?? null,
    phone: account?.phone ?? null,
  });
}
