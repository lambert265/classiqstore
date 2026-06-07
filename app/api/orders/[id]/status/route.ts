import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail, orderStatusEmail } from "@/lib/brevo";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServiceClient();
  const { status } = await req.json();

  const { data: order, error } = await sb
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("*, profiles(full_name, email)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const customerEmail = order.profiles?.email;
  const customerName = order.profiles?.full_name ?? "Customer";
  if (customerEmail) {
    try {
      const payload = orderStatusEmail(customerName, `NV-${id.slice(0, 8).toUpperCase()}`, status, order.total_amount);
      payload.to = [{ email: customerEmail, name: customerName }];
      await sendEmail(payload);
    } catch (e) { console.error("Brevo email failed:", e); }
  }

  return NextResponse.json(order);
}
