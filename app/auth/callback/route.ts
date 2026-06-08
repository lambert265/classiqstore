import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, welcomeEmail } from "@/lib/brevo";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: type as "email" | "signup" | "recovery" | "email_change" });
    if (!error && data.user) {
      const user = data.user;
      const isNewUser = user.created_at && Date.now() - new Date(user.created_at).getTime() < 60_000;
      if (isNewUser) {
        const name: string = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "there";
        try { await sendEmail(welcomeEmail(name, user.email!)); } catch {}
      }
    }
  } else if (code) {
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const user = data?.user;
    if (user) {
      const isNewUser = user.created_at && Date.now() - new Date(user.created_at).getTime() < 60_000;
      if (isNewUser) {
        const name: string = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "there";
        try { await sendEmail(welcomeEmail(name, user.email!)); } catch {}
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
