import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const sb = createServiceClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let query = sb.from("orders").select("id,status,total_amount,created_at,shipping_address,profiles(full_name,email)");
  if (status && status !== "all") query = query.eq("status", status);
  if (startDate) query = query.gte("created_at", startDate);
  if (endDate) query = query.lte("created_at", endDate);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []).map((o: any) =>
    [o.id, o.profiles?.full_name ?? "", o.profiles?.email ?? "", o.status, o.total_amount,
      o.shipping_address?.city ?? "", o.shipping_address?.state ?? "",
      new Date(o.created_at).toLocaleDateString("en-NG")].join(",")
  );

  const csv = ["ID,Customer,Email,Status,Amount,City,State,Date", ...rows].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders-${Date.now()}.csv"`,
    },
  });
}
