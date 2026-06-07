import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const sb = createServiceClient();
  const { action, productIds, flashSalePrice } = await req.json();

  const updates: Record<string, unknown> =
    action === "flash_sale_on"
      ? { is_flash_sale: true, ...(flashSalePrice ? { flash_sale_price: flashSalePrice } : {}) }
      : { is_flash_sale: false, flash_sale_price: null };

  const { error, count } = await sb.from("products").update(updates).in("id", productIds);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ updated: count });
}
