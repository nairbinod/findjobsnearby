import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/auth";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: account } = await supabase.from("accounts").select("id").eq("id", data.user.id).maybeSingle();
      if (!account) {
        await supabase.from("accounts").insert({
          id: data.user.id,
          role: data.user.user_metadata.role ?? "candidate",
        });
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
