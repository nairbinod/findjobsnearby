import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const account = userData.user
    ? (await supabase.from("accounts").select("role").eq("id", userData.user.id).maybeSingle()).data
    : null;

  if (!userData.user || account?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[var(--cream)]">
        <main className="mx-auto max-w-[600px] px-6 py-20 text-center">
          <h1 className="display text-4xl font-bold">Admin access only</h1>
          <p className="mt-4 text-[var(--muted)]">Sign in with an admin account to reach the moderation dashboard.</p>
          <Link href="/auth" className="mt-6 inline-block rounded-full bg-[var(--coral)] px-6 py-3 text-sm font-bold text-white">Sign in <span aria-hidden="true">→</span></Link>
        </main>
      </div>
    );
  }

  return <AdminDashboard />;
}
