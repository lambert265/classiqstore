import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, welcomeEmail } from "@/lib/brevo";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // Send welcome email only on first sign-up (email confirmation flow)
    const user = data?.user;
    if (user) {
      const isNewUser =
        user.created_at &&
        Date.now() - new Date(user.created_at).getTime() < 60_000; // within last 60s

      if (isNewUser) {
        const name: string =
          user.user_metadata?.full_name ??
          user.email?.split("@")[0] ??
          "there";
        try {
          await sendEmail(welcomeEmail(name, user.email!));
        } catch (err) {
          // Non-fatal — don't block redirect if email fails
          console.error("Welcome email failed:", err);
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
