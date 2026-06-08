import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY")!;
const SITE_URL = "https://classiqstore.pxxl.click";

serve(async (req) => {
  try {
    const payload = await req.json();
    const user = payload?.record;
    if (!user?.email) return new Response("No email", { status: 400 });

    const name: string =
      user.raw_user_meta_data?.full_name ??
      user.email.split("@")[0] ??
      "there";

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "CLASSIQ", email: "samuelfisheries@gmail.com" },
        to: [{ email: user.email, name }],
        subject: "Welcome to CLASSIQ — You're in.",
        htmlContent: `
          <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:48px 24px;color:#0F172A;background:#ffffff">
            <p style="font-size:26px;font-weight:700;letter-spacing:0.18em;margin:0 0 32px;text-transform:uppercase">CLASSIQ</p>
            <h1 style="font-size:24px;font-weight:600;margin:0 0 12px">Welcome, ${name}.</h1>
            <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 28px">
              Your account is ready. Explore our new collection of refined womenswear — crafted with intention, made to last.
            </p>
            <a href="${SITE_URL}" style="display:inline-block;padding:14px 32px;background:#0F172A;color:#ffffff;border-radius:999px;text-decoration:none;font-size:12px;letter-spacing:0.16em;text-transform:uppercase">
              Shop the collection
            </a>
            <div style="margin:40px 0;padding:24px;background:#F8FAFC;border-radius:16px">
              <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:#94A3B8">Your account perks</p>
              <ul style="margin:0;padding:0 0 0 16px;color:#475569;font-size:14px;line-height:2">
                <li>Track all your orders in one place</li>
                <li>Save pieces to your wishlist</li>
                <li>Request custom &amp; bespoke pieces</li>
                <li>Early access to new drops</li>
              </ul>
            </div>
            <p style="font-size:13px;color:#475569;line-height:1.7">
              Questions? Reach us at <a href="mailto:samuelfisheries@gmail.com" style="color:#0F172A">samuelfisheries@gmail.com</a>.
            </p>
            <p style="margin-top:40px;font-size:11px;color:#CBD5E1">
              © CLASSIQ · Lagos, Nigeria ·
              <a href="${SITE_URL}/privacy" style="color:#CBD5E1">Privacy Policy</a>
            </p>
          </div>`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Brevo error:", err);
      return new Response(err, { status: 500 });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Error:", err);
    return new Response("Error", { status: 500 });
  }
});
