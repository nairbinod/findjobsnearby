import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/auth";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const errorUrl = new URL("/auth", requestUrl.origin);
      errorUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(errorUrl);
    }

    if (data.user) {
      const { data: account } = await supabase.from("accounts").select("id").eq("id", data.user.id).maybeSingle();
      if (!account) {
        const { error: accountError } = await supabase.from("accounts").insert({
          id: data.user.id,
          role: data.user.user_metadata.role ?? "candidate",
        });
        if (accountError) {
          const errorUrl = new URL("/auth", requestUrl.origin);
          errorUrl.searchParams.set("error", accountError.message);
          return NextResponse.redirect(errorUrl);
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
