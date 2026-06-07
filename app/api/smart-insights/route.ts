import Groq from "groq-sdk";
import { createServiceClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const revalidate = 3600;

export async function GET() {
  try {
    const supabase = createServiceClient();

    const [ordersRes, productsRes, requestsRes, subscribersRes] = await Promise.all([
      supabase.from("orders").select("id,status,total_amount,created_at,items"),
      supabase.from("products").select("id,name,price,stock_count,category"),
      supabase.from("custom_requests").select("id,status,quote_amount"),
      supabase.from("subscribers").select("id", { count: "exact", head: true }),
    ]);

    const orders   = ordersRes.data   ?? [];
    const products = productsRes.data ?? [];
    const requests = requestsRes.data ?? [];
    const now      = new Date();

    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonth = (() => {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    })();

    const nonCancelled  = orders.filter(o => o.status !== "cancelled");
    const thisMonthRev  = nonCancelled.filter(o => o.created_at?.startsWith(thisMonth)).reduce((s, o) => s + (o.total_amount ?? 0), 0);
    const lastMonthRev  = nonCancelled.filter(o => o.created_at?.startsWith(lastMonth)).reduce((s, o) => s + (o.total_amount ?? 0), 0);
    const totalRevenue  = nonCancelled.reduce((s, o) => s + (o.total_amount ?? 0), 0);
    const avgOrder      = nonCancelled.length ? Math.round(totalRevenue / nonCancelled.length) : 0;
    const growthPct     = lastMonthRev > 0 ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100) : null;
    const pendingOrders = orders.filter(o => o.status === "pending_confirmation").length;
    const lowStock      = products.filter(p => (p.stock_count ?? 0) > 0 && (p.stock_count ?? 0) < 5);
    const outOfStock    = products.filter(p => (p.stock_count ?? 0) === 0);
    const pendingReqs   = requests.filter(r => r.status === "pending").length;

    const soldMap: Record<string, number> = {};
    orders.forEach(o => {
      (o.items as { product_id?: string; quantity?: number }[] ?? []).forEach(item => {
        if (item.product_id) soldMap[item.product_id] = (soldMap[item.product_id] ?? 0) + (item.quantity ?? 1);
      });
    });
    const topProduct = [...products].sort((a, b) => (soldMap[b.id] ?? 0) - (soldMap[a.id] ?? 0))[0];

    const today      = now.toISOString().slice(0, 10);
    const yesterday   = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
    const todayRev    = nonCancelled.filter(o => o.created_at?.startsWith(today)).reduce((s, o) => s + (o.total_amount ?? 0), 0);
    const yesterdayRev = nonCancelled.filter(o => o.created_at?.startsWith(yesterday)).reduce((s, o) => s + (o.total_amount ?? 0), 0);
    const todayOrders = orders.filter(o => o.created_at?.startsWith(today)).length;
    const anomaly     = yesterdayRev > 0 && todayRev === 0 && todayOrders === 0 ? "ANOMALY: Zero revenue and zero orders today despite activity yesterday." : null;

    const storeData = `STORE SNAPSHOT (${now.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}):\n- Total revenue: ₦${totalRevenue.toLocaleString()}\n- This month: ₦${thisMonthRev.toLocaleString()} | Last month: ₦${lastMonthRev.toLocaleString()}\n- Month growth: ${growthPct !== null ? `${growthPct > 0 ? "+" : ""}${growthPct}%` : "N/A"}\n- Avg order value: ₦${avgOrder.toLocaleString()}\n- Total orders: ${orders.length} | Pending confirmation: ${pendingOrders}\n- Today's revenue: ₦${todayRev.toLocaleString()} | Yesterday: ₦${yesterdayRev.toLocaleString()}\n- Top product: ${topProduct ? `${topProduct.name} (${soldMap[topProduct.id] ?? 0} sold)` : "none"}\n- Low stock: ${lowStock.map(p => `${p.name} (${p.stock_count} left)`).join(", ") || "none"}\n- Out of stock: ${outOfStock.map(p => p.name).join(", ") || "none"}\n- Pending custom requests: ${pendingReqs}\n- Email subscribers: ${subscribersRes.count ?? 0}\n${anomaly ? `- ⚠️ ${anomaly}` : ""}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are Knotté AI for CLASSIQ, a premium authored womenswear brand in Lagos, Nigeria.\nAnalyse the store data and return EXACTLY a JSON array of 3 insight cards. No markdown, no explanation — pure JSON only.\n\nEach card must have:\n- "type": one of "alert" | "opportunity" | "content"\n- "title": short punchy title (max 6 words)\n- "body": specific insight using real numbers (max 25 words)\n- "action": what the admin should do right now (max 12 words)\n- "actionHref": one of "/admin/orders" | "/admin/products" | "/admin/custom-requests" | "/admin/subscribers" | "/admin/analytics"\n- "urgent": boolean (true only if something needs immediate attention)\n\nRules:\n- "alert" = something wrong or urgent (low stock, pending orders, revenue drop)\n- "opportunity" = something to capitalise on (top product, growth, upsell)\n- "content" = a specific content/social media idea based on what's selling\n- Use ₦ for naira. Be specific with numbers. No generic advice.\n- CLASSIQ sells shirts, gowns, skirts, trousers, shoes, bags, accessories, jewelry, and outerwear for women.`,
        },
        { role: "user", content: storeData },
      ],
      max_tokens: 500,
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";
    const match = raw.match(/\[[\s\S]*\]/);
    const insights = match ? JSON.parse(match[0]) : [];

    return Response.json({ insights, generatedAt: now.toISOString() });
  } catch (error) {
    console.error("Smart insights error:", error);
    return Response.json({ insights: [], generatedAt: new Date().toISOString() });
  }
}
