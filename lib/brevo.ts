import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");

const BREVO_API = "https://api.brevo.com/v3/smtp/email";

interface EmailPayload {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  sender?: { name: string; email: string };
}

export async function sendEmail(payload: EmailPayload) {
  const res = await fetch(BREVO_API, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: payload.sender ?? { name: "CLASSIQ", email: "hello@classiq.ng" },
      ...payload,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo error: ${err}`);
  }
  return res.json();
}

export function welcomeEmail(name: string, email: string): EmailPayload {
  return {
    to: [{ email, name }],
    subject: "Welcome to CLASSIQ — You're in.",
    htmlContent: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:48px 24px;color:#0F172A;background:#ffffff">
        <p style="font-size:28px;font-weight:700;letter-spacing:0.18em;margin:0 0 32px">CLASSIQ</p>

        <h1 style="font-size:26px;font-weight:600;margin:0 0 12px;color:#0F172A">Welcome, ${name}.</h1>
        <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 28px">
          Your account is ready. Explore our new collection of refined womenswear — crafted with intention, made to last.
        </p>

        <a href="https://classiqstore.pxxl.click" style="display:inline-block;padding:14px 32px;background:#0F172A;color:#ffffff;border-radius:999px;text-decoration:none;font-size:12px;letter-spacing:0.16em;text-transform:uppercase">
          Shop the collection
        </a>

        <div style="margin:40px 0;padding:24px;background:#F8FAFC;border-radius:16px">
          <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:#94A3B8">Your account perks</p>
          <ul style="margin:0;padding:0 0 0 16px;color:#475569;font-size:14px;line-height:2">
            <li>Track all your orders in one place</li>
            <li>Save pieces to your wishlist</li>
            <li>Request custom & bespoke pieces</li>
            <li>Early access to new drops</li>
          </ul>
        </div>

        <p style="font-size:13px;color:#475569;line-height:1.7">
          Questions? Reply to this email or reach us at
          <a href="mailto:hello@classiq.ng" style="color:#0F172A">hello@classiq.ng</a>.
        </p>

        <p style="margin-top:40px;font-size:11px;color:#CBD5E1">
          © CLASSIQ · Lagos, Nigeria ·
          <a href="https://classiqstore.pxxl.click/privacy" style="color:#CBD5E1">Privacy Policy</a>
        </p>
      </div>`,
  };
}

export function orderStatusEmail(
  customerName: string,
  orderId: string,
  status: string,
  total: number
): EmailPayload {
  const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;
  const statusLabels: Record<string, string> = {
    confirmed: "Your order has been confirmed",
    processing: "Your order is being processed",
    shipped: "Your order is on its way",
    delivered: "Your order has been delivered",
    cancelled: "Your order has been cancelled",
  };
  return {
    to: [],
    subject: `Order ${orderId} — ${statusLabels[status] ?? status}`,
    htmlContent: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#0F172A">
        <h1 style="font-size:24px;margin-bottom:8px">CLASSIQ</h1>
        <p style="color:#475569;margin-bottom:24px">Hi ${customerName},</p>
        <h2 style="font-size:20px;margin-bottom:8px">${statusLabels[status] ?? status}</h2>
        <p style="color:#475569">Order <strong>${orderId}</strong> · Total <strong>${fmt(total)}</strong></p>
        <a href="https://classiqstore.pxxl.click/profile" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#3B82F6;color:#fff;border-radius:999px;text-decoration:none;font-size:13px;letter-spacing:0.1em">
          Track your order
        </a>
        <p style="margin-top:32px;font-size:12px;color:#94A3B8">© CLASSIQ. You're receiving this because you placed an order with us.</p>
      </div>`,
  };
}

export function quoteEmail(
  customerName: string,
  requestId: string,
  productType: string,
  quoteAmount: number
): EmailPayload {
  const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;
  return {
    to: [],
    subject: `Your custom ${productType} quote — ${fmt(quoteAmount)}`,
    htmlContent: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#0F172A">
        <h1 style="font-size:24px;margin-bottom:8px">CLASSIQ</h1>
        <p style="color:#475569;margin-bottom:24px">Hi ${customerName},</p>
        <h2 style="font-size:20px;margin-bottom:8px">Your custom quote is ready</h2>
        <p style="color:#475569">We've reviewed your request for a <strong>${productType}</strong> and prepared a quote for you.</p>
        <div style="background:#F1F5F9;border-radius:12px;padding:20px;margin:24px 0">
          <p style="margin:0;font-size:28px;font-weight:700;color:#3B82F6">${fmt(quoteAmount)}</p>
          <p style="margin:4px 0 0;color:#475569;font-size:13px">Request #${requestId.slice(0, 8).toUpperCase()}</p>
        </div>
        <a href="https://classiqstore.pxxl.click/profile" style="display:inline-block;padding:12px 28px;background:#3B82F6;color:#fff;border-radius:999px;text-decoration:none;font-size:13px;letter-spacing:0.1em">
          Accept quote
        </a>
        <p style="margin-top:32px;font-size:12px;color:#94A3B8">© CLASSIQ</p>
      </div>`,
  };
}
