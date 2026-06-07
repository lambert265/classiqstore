import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RevenueChart, WeeklySalesChart, CategoryDonut } from "@/components/admin/Charts";
import RecentOrders, { RecentOrder } from "@/components/admin/RecentOrders";
import TopProducts, { TopProduct } from "@/components/admin/TopProducts";
import { AudienceMetrics, QuickActions } from "@/components/admin/SidebarWidgets";
import { StatsGrid, LastUpdated, StatDef, PendingActionsBanner, StockHealthBar, RevenueGoal } from "@/components/admin/DashboardShell";
import { FadeSection } from "@/components/admin/FadeSection";
import RealtimeOrders from "@/components/admin/RealtimeOrders";
import SmartInsights from "@/components/admin/SmartInsights";
import StoreMetrics from "@/components/admin/StoreMetrics";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(s) { try { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const now = new Date();

  const [profileRes, ordersRes, subscribersRes, productsRes, usersRes, settingsRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase.from("orders").select("id,status,total_amount,created_at,shipping_address,items").order("created_at", { ascending: false }),
    supabase.from("subscribers").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id,name,stock_count,price,category"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_admin", false),
    supabase.from("settings").select("key,value").eq("key", "monthly_goal").single(),
  ]);

  const MONTHLY_GOAL = Number(settingsRes.data?.value ?? 500_000) || 500_000;
  const orders = ordersRes.data ?? [];
  const prods = productsRes.data ?? [];
  const nonCancelled = orders.filter(o => o.status !== "cancelled");

  const lowStockCount = prods.filter(p => (p.stock_count ?? 0) > 0 && (p.stock_count ?? 0) < 5).length;
  const outStockCount = prods.filter(p => (p.stock_count ?? 0) === 0).length;
  const healthyCount = prods.length - lowStockCount - outStockCount;

  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthRev = nonCancelled.filter(o => o.created_at?.startsWith(thisMonth)).reduce((s, o) => s + (o.total_amount ?? 0), 0);
  const lastMonthRev = nonCancelled.filter(o => o.created_at?.startsWith(lastMonth)).reduce((s, o) => s + (o.total_amount ?? 0), 0);
  const thisMonthOrd = orders.filter(o => o.created_at?.startsWith(thisMonth)).length;
  const lastMonthOrd = orders.filter(o => o.created_at?.startsWith(lastMonth)).length;
  const revTrend = lastMonthRev > 0 ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100) : undefined;
  const ordTrend = lastMonthOrd > 0 ? Math.round(((thisMonthOrd - lastMonthOrd) / lastMonthOrd) * 100) : undefined;

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("default", { month: "short" }) };
  });
  const revenueData = months.map(({ key, label }) => ({
    month: label,
    revenue: orders.filter(o => o.status !== "cancelled" && o.created_at?.startsWith(key)).reduce((s, o) => s + (o.total_amount ?? 0), 0),
  }));

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklySalesData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { day: DAY_LABELS[d.getDay()], sales: orders.filter(o => o.status !== "cancelled" && o.created_at?.startsWith(key)).reduce((s, o) => s + (o.total_amount ?? 0), 0) };
  });

  const REAL_CATS = ["beanie", "skirt", "set", "bag", "accessory", "shorts", "baby_wear"];
  const categoryData = REAL_CATS.map(cat => ({ name: cat, value: prods.filter(p => p.category === cat).length || 0 })).filter(d => d.value > 0);

  const STATUS_MAP: Record<string, RecentOrder["status"]> = {
    shipped: "Shipped", processing: "Processing", delivered: "Delivered",
    pending_confirmation: "Pending", confirmed: "Processing",
  };
  const recentOrders: RecentOrder[] = orders.slice(0, 8).map(o => ({
    id: o.id,
    customer: (o.shipping_address as { full_name?: string })?.full_name ?? "—",
    item: (o.items as any[])?.[0]?.name ?? "—",
    amount: o.total_amount ?? 0,
    status: STATUS_MAP[o.status] ?? "Pending",
    rawStatus: o.status,
  }));

  const SWATCH: Record<string, { emoji: string; color: string }> = {
    bag: { emoji: "👜", color: "#2a1f14" }, skirt: { emoji: "👗", color: "#201420" },
    set: { emoji: "👚", color: "#1f1420" }, beanie: { emoji: "🧢", color: "#14201a" },
    accessory: { emoji: "💍", color: "#1a1420" }, shorts: { emoji: "🩳", color: "#201414" },
    baby_wear: { emoji: "🍼", color: "#1a2014" },
  };
  const soldMap: Record<string, number> = {};
  orders.forEach(o => { (o.items as any[])?.forEach((item: any) => { if (item?.product_id) soldMap[item.product_id] = (soldMap[item.product_id] ?? 0) + (item.quantity ?? 1); }); });
  const topProducts: TopProduct[] = prods.sort((a, b) => (soldMap[b.id] ?? 0) - (soldMap[a.id] ?? 0)).slice(0, 5).map(p => {
    const key = Object.keys(SWATCH).find(k => p.category === k) ?? "bag";
    return { name: p.name ?? "Product", swatch: SWATCH[key].emoji, swatchColor: SWATCH[key].color, unitsSold: soldMap[p.id] ?? 0, price: p.price ?? 0, stockPct: Math.min(Math.round(((p.stock_count ?? 0) / 50) * 100), 100) };
  });

  const totalCustomers = usersRes.count ?? 1;
  const uniqueBuyers = orders.reduce((set, o) => { const name = (o.shipping_address as { full_name?: string })?.full_name; if (name) set.add(name); return set; }, new Set<string>()).size;
  const avgOrderValue = nonCancelled.length ? Math.round(nonCancelled.reduce((s, o) => s + (o.total_amount ?? 0), 0) / nonCancelled.length) : 0;
  const audienceData = { repeatPct: totalCustomers > 0 ? Math.round((Math.min(uniqueBuyers, totalCustomers) / totalCustomers) * 100) : 0, avgOrderValue, abandonPct: 24 };

  const confirmedOrders = orders.filter(o => ["confirmed", "processing", "shipped", "delivered"].includes(o.status)).length;
  const cancelledOrders = orders.filter(o => o.status === "cancelled").length;
  const decidedOrders = confirmedOrders + cancelledOrders;
  const confirmationRate = decidedOrders > 0 ? Math.round((confirmedOrders / decidedOrders) * 100) : 0;
  const cancellationRate = decidedOrders > 0 ? Math.round((cancelledOrders / decidedOrders) * 100) : 0;

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayStats: Record<number, { orders: number; revenue: number }> = {};
  orders.forEach(o => { const day = new Date(o.created_at).getDay(); if (!dayStats[day]) dayStats[day] = { orders: 0, revenue: 0 }; dayStats[day].orders++; dayStats[day].revenue += o.total_amount ?? 0; });
  const bestDayEntry = Object.entries(dayStats).sort((a, b) => b[1].orders - a[1].orders)[0];
  const bestDay = bestDayEntry ? { day: DAY_NAMES[Number(bestDayEntry[0])], orders: bestDayEntry[1].orders, revenue: Math.round(bestDayEntry[1].revenue / bestDayEntry[1].orders) } : null;

  const customerOrderCount: Record<string, number> = {};
  orders.forEach(o => { const name = (o.shipping_address as { full_name?: string })?.full_name; if (name) customerOrderCount[name] = (customerOrderCount[name] ?? 0) + 1; });
  const uniqueCustomers = Object.keys(customerOrderCount).length;
  const returnCustomers = Object.values(customerOrderCount).filter(c => c > 1).length;
  const returnRate = uniqueCustomers > 0 ? Math.round((returnCustomers / uniqueCustomers) * 100) : 0;

  const pendingOrdersCount = orders.filter(o => o.status === "pending_confirmation").length;
  const pendingActions = [
    { label: "orders need confirmation", count: pendingOrdersCount, href: "/admin/orders",   color: "bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20" },
    { label: "products out of stock",    count: outStockCount,       href: "/admin/products", color: "bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20"         },
  ];

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning, Queen" : hour < 17 ? "Good afternoon, Queen" : "Good evening, Queen";

  const STATS: StatDef[] = [
    { label: "This Month",   numericValue: thisMonthRev, rawValue: `₦${thisMonthRev.toLocaleString()}`, sub: revTrend !== undefined ? "vs last month" : "Current month", iconKey: "TrendingUp", href: "/admin/analytics",   color: "text-[#C9A84C]",  bg: "bg-[#C9A84C]/10 border-[#C9A84C]/20",   trend: revTrend },
    { label: "Total Orders", numericValue: orders.length,                                                sub: `${pendingOrdersCount} pending`,                            iconKey: "ShoppingBag", href: "/admin/orders",      color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",      trend: ordTrend },
    { label: "Customers",    numericValue: usersRes.count ?? 0,                                          sub: "Registered",                                               iconKey: "Users",       href: "/admin/users",       color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Products",     numericValue: prods.length,                                                 sub: `${lowStockCount} low stock`,                               iconKey: "Package",     href: "/admin/products",    color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20"   },
    { label: "Subscribers",  numericValue: subscribersRes.count ?? 0,                                    sub: "Email list",                                               iconKey: "Mail",        href: "/admin/subscribers", color: "text-pink-400",   bg: "bg-pink-500/10 border-pink-500/20"     },
  ];

  return (
    <div className="xl:flex xl:gap-6 xl:items-start space-y-5 xl:space-y-0">
      <div className="flex-1 min-w-0 space-y-5">
        <FadeSection delay={0}>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C9A84C]/60 font-body mb-1">Overview</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white">{greeting} 👋</h1>
          <p className="text-sm text-white/40 font-body mt-1">Here&apos;s what&apos;s happening with your store today.</p>
          <LastUpdated />
          <div className="mt-2">
            <p className="font-body text-[10px] tracking-[0.15em] uppercase text-white/25 mb-1">Live Orders</p>
            <RealtimeOrders initialCount={orders.length} />
          </div>
        </FadeSection>

        <FadeSection delay={50}><PendingActionsBanner actions={pendingActions} /></FadeSection>
        <FadeSection delay={80}><SmartInsights /></FadeSection>
        <FadeSection delay={100}><StatsGrid stats={STATS} /></FadeSection>

        <FadeSection delay={150}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RevenueGoal current={thisMonthRev} goal={MONTHLY_GOAL} />
            <StockHealthBar stock={{ total: prods.length, healthy: healthyCount, low: lowStockCount, out: outStockCount }} />
          </div>
        </FadeSection>

        <FadeSection delay={170}>
          <StoreMetrics confirmationRate={confirmationRate} cancellationRate={cancellationRate} bestDay={bestDay} returnRate={returnRate} returnCustomers={returnCustomers} totalCustomers={uniqueCustomers} />
        </FadeSection>

        <FadeSection delay={200}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass-card rounded-2xl p-5 chart-card min-w-0">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-0.5">Revenue</p>
              <p className="font-heading text-xl font-semibold text-white mb-5">Last 6 Months</p>
              <RevenueChart data={revenueData} />
            </div>
            <div className="glass-card rounded-2xl p-5 chart-card min-w-0">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-0.5">Sales</p>
              <p className="font-heading text-xl font-semibold text-white mb-4">By Category</p>
              <div className="border-t border-white/6 pt-4"><CategoryDonut data={categoryData} /></div>
            </div>
          </div>
        </FadeSection>

        <FadeSection delay={300}>
          <div className="glass-card rounded-2xl p-5 chart-card min-w-0">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-0.5">Volume</p>
            <p className="font-heading text-xl font-semibold text-white mb-5">Sales This Week</p>
            <WeeklySalesChart data={weeklySalesData} />
          </div>
        </FadeSection>

        <FadeSection delay={400}><RecentOrders orders={recentOrders} /></FadeSection>
      </div>

      <aside className="hidden xl:flex flex-col gap-4 w-[240px] shrink-0">
        <div className="glass-card glass-float rounded-2xl p-5 flex flex-col gap-6 sticky top-6">
          <TopProducts products={topProducts} />
          <div className="border-t border-white/6 pt-5"><AudienceMetrics data={audienceData} /></div>
          <div className="border-t border-white/6 pt-5"><QuickActions /></div>
        </div>
      </aside>

      <div className="xl:hidden space-y-4">
        <div className="glass-card rounded-2xl p-5"><TopProducts products={topProducts} /></div>
        <div className="glass-card rounded-2xl p-5"><AudienceMetrics data={audienceData} /></div>
        <div className="glass-card rounded-2xl p-5"><QuickActions /></div>
      </div>
    </div>
  );
}
