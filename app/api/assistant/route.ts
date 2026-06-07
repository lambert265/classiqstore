import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { createServiceClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getStoreContext() {
  const supabase = createServiceClient();

  const [ordersRes, productsRes, requestsRes, subscribersRes] = await Promise.all([
    supabase.from("orders").select("id,status,total_amount,created_at,items"),
    supabase.from("products").select("id,name,price,stock_count,category,size_prices"),
    supabase.from("custom_requests").select("id,status,product_type,quote_amount"),
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

  const nonCancelled   = orders.filter(o => o.status !== "cancelled");
  const totalRevenue   = nonCancelled.reduce((s, o) => s + (o.total_amount ?? 0), 0);
  const thisMonthRev   = nonCancelled.filter(o => o.created_at?.startsWith(thisMonth)).reduce((s, o) => s + (o.total_amount ?? 0), 0);
  const lastMonthRev   = nonCancelled.filter(o => o.created_at?.startsWith(lastMonth)).reduce((s, o) => s + (o.total_amount ?? 0), 0);
  const avgOrderValue  = nonCancelled.length ? Math.round(totalRevenue / nonCancelled.length) : 0;
  const pendingOrders  = orders.filter(o => o.status === "pending_confirmation").length;
  const shippedOrders  = orders.filter(o => o.status === "shipped").length;

  const soldMap: Record<string, number> = {};
  orders.forEach(o => {
    (o.items as { product_id?: string; quantity?: number }[] ?? []).forEach(item => {
      if (item.product_id) soldMap[item.product_id] = (soldMap[item.product_id] ?? 0) + (item.quantity ?? 1);
    });
  });
  const topProducts = products
    .sort((a, b) => (soldMap[b.id] ?? 0) - (soldMap[a.id] ?? 0))
    .slice(0, 5)
    .map(p => `${p.name} (₦${p.price?.toLocaleString()}, ${soldMap[p.id] ?? 0} sold, ${p.stock_count} in stock)`);

  const lowStock   = products.filter(p => (p.stock_count ?? 0) > 0 && (p.stock_count ?? 0) < 5);
  const outOfStock = products.filter(p => (p.stock_count ?? 0) === 0);

  const pendingRequests   = requests.filter(r => r.status === "pending").length;
  const inProgressRequests = requests.filter(r => r.status === "in_progress").length;
  const customRevenue     = requests.filter(r => r.quote_amount).reduce((s, r) => s + (r.quote_amount ?? 0), 0);

  const growthPct = lastMonthRev > 0
    ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100)
    : null;

  return `
=== LIVE CLASSIQ STORE DATA (as of ${now.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}) ===

REVENUE:
- Total all-time revenue: ₦${totalRevenue.toLocaleString()}
- This month (${thisMonth}): ₦${thisMonthRev.toLocaleString()}
- Last month (${lastMonth}): ₦${lastMonthRev.toLocaleString()}
- Month-on-month growth: ${growthPct !== null ? `${growthPct > 0 ? "+" : ""}${growthPct}%` : "N/A (no prior month data)"}
- Average order value: ₦${avgOrderValue.toLocaleString()}

ORDERS:
- Total orders: ${orders.length}
- Pending confirmation: ${pendingOrders}
- Currently shipped: ${shippedOrders}
- Cancelled: ${orders.filter(o => o.status === "cancelled").length}

PRODUCTS (${products.length} total):
- Top sellers: ${topProducts.join(" | ") || "No sales yet"}
- Low stock (< 5 units): ${lowStock.map(p => `${p.name} (${p.stock_count} left)`).join(", ") || "None"}
- Out of stock: ${outOfStock.map(p => p.name).join(", ") || "None"}

CUSTOM REQUESTS:
- Pending quotes: ${pendingRequests}
- In progress: ${inProgressRequests}
- Custom order revenue: ₦${customRevenue.toLocaleString()}

SUBSCRIBERS: ${subscribersRes.count ?? 0} email subscribers
===`;
}

const BASE_SYSTEM = `You are Knotté, a senior data analyst and business strategist embedded inside the CLASSIQ admin dashboard. CLASSIQ is a premium authored womenswear brand based in Lagos, Nigeria.

You have direct access to live store data. Your job is to analyse it rigorously and give the owner clear, data-driven decisions — not generic advice.

## YOUR ANALYST STANDARDS
- Always cite specific numbers from the live data. Never say "your revenue is good" — say "revenue is ₦X, up Y% from last month"
- When asked a question, lead with the direct answer, then support it with data
- Identify patterns, anomalies, and trends proactively
- Flag risks before they become problems (low stock, declining orders, unconfirmed payments)
- Give ranked recommendations — most impactful first
- Show calculations when projecting targets or estimating outcomes
- Compare periods (this month vs last month, this week vs last week) whenever relevant
- Be concise in chat, thorough in plans

## ANALYSIS FRAMEWORKS YOU USE
- Revenue breakdown: total, this month, last month, MoM growth, avg order value
- Product performance: units sold, revenue per product, stock velocity, restock urgency
- Order funnel: pending → confirmed → processing → shipped → delivered, drop-off rates
- Customer behaviour: repeat rate, avg orders per customer, top buyers
- Inventory health: healthy / low stock / out of stock ratios
- Custom request pipeline: pending quotes, in-progress, conversion rate

## CONTENT & STRATEGY (when asked)
- Write platform-specific content: TikTok hooks, Instagram captions, WhatsApp broadcasts
- Build content calendars grounded in what's actually selling
- Plan campaigns with timelines, targets, and copy
- Always tie content strategy back to the data — promote what's selling, clear what's stagnant

## CLASSIQ PRODUCT CATEGORIES
- Shirts, Gowns, Skirts, Trousers, Shoes, Bags, Accessories, Jewelry, Outerwear
- All products are for women. Premium, authored womenswear in soft neutrals.

## TONE
- Professional but direct — like a trusted CFO/analyst, not a chatbot
- No filler phrases. No "Great question!". No unnecessary emojis in analysis
- Use ₦ for naira. Use tables or bullet lists for comparisons
- When the data shows a problem, say it clearly. When it shows an opportunity, quantify it`;;

export async function POST(req: NextRequest) {
  try {
    const { messages, mode } = await req.json();

    let systemContent = BASE_SYSTEM;

    const context = await getStoreContext();
    systemContent += `\n\n${context}`;

    if (mode === "insight") {
      systemContent += `\n\nThe admin has requested an automatic business insight. Analyse the live data above and provide:\n1. A headline metric (best number to celebrate or most urgent issue)\n2. Top 2–3 actionable insights from the data\n3. One specific recommendation for today\nBe direct, specific, and use the actual numbers. Format with clear sections.`;
    }

    if (mode === "plan") {
      systemContent += `\n\nThe admin is in PLANNING MODE. They want detailed, step-by-step strategic plans. When responding:\n- Give structured, actionable plans with clear phases or steps\n- Include specific timelines, targets, and metrics where relevant\n- Use the live store data to make the plan specific to their current situation\n- For social media plans, include specific post ideas, captions, and hashtags\n- For revenue plans, show the exact calculations and targets needed\n- Be thorough — this is a planning session, not a quick answer`;
    }

    if (mode === "content") {
      systemContent += `\n\nThe admin is in CONTENT MODE. They want specific, ready-to-use content for social media. When responding:\n- Give platform-specific ideas (TikTok, Instagram Reels, Stories, Pinterest, WhatsApp)\n- Write actual captions, hooks, and scripts — not descriptions of what to write\n- Reference the top-selling products from the live data in your ideas\n- Include relevant hashtags (mix of Nigerian fashion tags + womenswear tags)\n- Suggest specific video formats, transitions, or trending audio styles where relevant\n- Every idea should be immediately actionable — no fluff\n- Remember: CLASSIQ is a premium womenswear brand selling shirts, gowns, skirts, trousers, shoes, bags, accessories, jewelry, and outerwear`;
    }

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemContent },
        ...messages,
      ],
      max_tokens: 1200,
      temperature: 0.6,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    console.error("Groq error:", error);
    return Response.json({ error: "Failed to get response" }, { status: 500 });
  }
}
