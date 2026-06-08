import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://classiqstore.pxxl.click";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "email" | "signup" | "recovery" | "email_change",
    });
    if (error) {
      return NextResponse.redirect(`${SITE_URL}/auth?error=confirmation_failed`);
    }
    // Confirmed — redirect straight to home, already signed in
    return NextResponse.redirect(`${SITE_URL}/`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${SITE_URL}/auth?error=oauth_failed`);
    }
    return NextResponse.redirect(`${SITE_URL}${next}`);
  }

  return NextResponse.redirect(`${SITE_URL}/auth`);
}
