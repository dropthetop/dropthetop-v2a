import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // In production behind a proxy, prefer x-forwarded-host
      const forwardedHost = request.headers.get("x-forwarded-host");
      const base =
        process.env.NEXT_PUBLIC_SITE_URL ??
        (forwardedHost ? `https://${forwardedHost}` : origin);
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`);
}
