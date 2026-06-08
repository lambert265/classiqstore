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
    await supabase.auth.verifyOtp({ token_hash, type: type as "email" | "signup" | "recovery" | "email_change" });
    return NextResponse.redirect(`${SITE_URL}/auth?confirmed=1`);
  }

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${SITE_URL}${next}`);
}
