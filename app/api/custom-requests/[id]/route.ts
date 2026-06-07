import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail, quoteEmail } from "@/lib/brevo";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServiceClient();
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  if (body.status) updates.status = body.status;
  if (body.quote_amount) { updates.quote_amount = body.quote_amount; updates.status = "quoted"; }

  const { data: request, error } = await sb
    .from("custom_requests")
    .update(updates)
    .eq("id", id)
    .select("*, profiles(full_name, email)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (body.quote_amount && request.profiles?.email) {
    try {
      const payload = quoteEmail(
        request.profiles.full_name ?? "Customer",
        id,
        request.product_type ?? "item",
        body.quote_amount
      );
      payload.to = [{ email: request.profiles.email, name: request.profiles.full_name ?? "" }];
      await sendEmail(payload);
    } catch (e) { console.error("Brevo quote email failed:", e); }
  }

  return NextResponse.json(request);
}
