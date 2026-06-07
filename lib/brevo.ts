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
      sender: payload.sender ?? { name: "CLASSIQ", email: "hello@CLASSIQ.com" },
      ...payload,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo error: ${err}`);
  }
  return res.json();
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
        <a href="https://CLASSIQ.com/profile" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#3B82F6;color:#fff;border-radius:999px;text-decoration:none;font-size:13px;letter-spacing:0.1em">
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
        <a href="https://CLASSIQ.com/profile" style="display:inline-block;padding:12px 28px;background:#3B82F6;color:#fff;border-radius:999px;text-decoration:none;font-size:13px;letter-spacing:0.1em">
          Accept quote
        </a>
        <p style="margin-top:32px;font-size:12px;color:#94A3B8">© CLASSIQ</p>
      </div>`,
  };
}
