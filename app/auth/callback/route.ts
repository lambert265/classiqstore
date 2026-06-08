import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, welcomeEmail } from "@/lib/brevo";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    const user = data?.user;
    if (user) {
      // Detect first sign-up: account created within last 60 seconds
      const isNewUser =
        user.created_at &&
        Date.now() - new Date(user.created_at).getTime() < 60_000;

      if (isNewUser) {
        const name: string =
          user.user_metadata?.full_name ??
          user.email?.split("@")[0] ??
          "there";
        try {
          await sendEmail(welcomeEmail(name, user.email!));
        } catch (err) {
          console.error("Welcome email failed:", err);
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
