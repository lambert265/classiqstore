import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ForexChart, WeeklySalesChart, CategoryDonut } from "@/components/admin/Charts";
import { ShoppingBag, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Analytics" };

async function getClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll(s) { try { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } }
  );
}

const CARD_STYLE = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
};

function KPICard({ label, value, sub, icon: Icon, accent, trend }: {
  label: string; value: string; sub: string; icon: React.ElementType; accent: string; trend?: number;
}) {
  const up = trend !== undefined && trend >= 0;
  return (
    <div className="relative rounded-2xl p-5 overflow-hidden chart-card cursor-default"
      style={{ background: `linear-gradient(135deg, ${accent}12 0%, ${accent}06 100%)`, border: `1px solid ${accent}25`, boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${accent}10, inset 0 1px 0 rgba(255,255,255,0.08)` }}>
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: accent }} />
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-[10px] font-body font-bold px-2.5 py-1 rounded-full border ${up ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-red-500/15 text-red-400 border-red-500/20"}`}>
            {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="font-heading text-4xl font-bold text-white leading-none mb-1" style={{ textShadow: `0 0 24px ${accent}50` }}>{value}</p>
      <p className="font-body text-sm text-white/60 font-medium">{label}</p>
      <p className="font-body text-[10px] text-white/30 mt-0.5">{sub}</p>
      <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl" style={{ background: `linear-gradient(90deg, transparent, ${accent}70, transparent)` }} />
    </div>
  );
}

export default async function AnalyticsPage() {
  const sb = await getClient();
  const [ordersRes, productsRes, usersRes, subsRes] = await Promise.all([
    sb.from("orders").select("id,status,total_amount,created_at,items").order("created_at", { ascending: false }),
    sb.from("products").select("id,name,price,category,stock_count"),
    sb.from("profiles").select("id,created_at").eq("is_admin", false),
    sb.from("subscribers").select("id,created_at"),
  ]);

  const orders = ordersRes.data ?? [];
  const products = productsRes.data ?? [];
  const users = usersRes.data ?? [];
  const subs = subsRes.data ?? [];
  const now = new Date();

  const nonCancelled = orders.filter(o => o.status !== "cancelled");
  const totalRevenue = nonCancelled.reduce((s, o) => s + (o.total_amount ?? 0), 0);
  const avgOrder = nonCancelled.length ? Math.round(totalRevenue / nonCancelled.length) : 0;

  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const revThis = nonCancelled.filter(o => o.created_at?.startsWith(thisMonth)).reduce((s, o) => s + (o.total_amount ?? 0), 0);
  const revLast = nonCancelled.filter(o => o.created_at?.startsWith(lastMonth)).reduce((s, o) => s + (o.total_amount ?? 0), 0);
  const revTrend = revLast > 0 ? Math.round(((revThis - revLast) / revLast) * 100) : 0;
  const ordThis = orders.filter(o => o.created_at?.startsWith(thisMonth)).length;
  const ordLast = orders.filter(o => o.created_at?.startsWith(lastMonth)).length;
  const ordTrend = ordLast > 0 ? Math.round(((ordThis - ordLast) / ordLast) * 100) : 0;
  const custThis = users.filter(u => u.created_at?.startsWith(thisMonth)).length;
  const custLast = users.filter(u => u.created_at?.startsWith(lastMonth)).length;
  const custTrend = custLast > 0 ? Math.round(((custThis - custLast) / custLast) * 100) : 0;

  const months12 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("default", { month: "short" }) };
  });
  const forexData = months12.map(({ key, label }) => ({
    label,
    revenue: nonCancelled.filter(o => o.created_at?.startsWith(key)).reduce((s, o) => s + (o.total_amount ?? 0), 0),
    orders: orders.filter(o => o.created_at?.startsWith(key)).length,
  }));

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklySalesData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { day: DAY_LABELS[d.getDay()], sales: nonCancelled.filter(o => o.created_at?.startsWith(key)).reduce((s, o) => s + (o.total_amount ?? 0), 0) };
  });

  const REAL_CATS = ["beanie", "skirt", "set", "bag", "accessory", "shorts", "baby_wear"];
  const categoryData = REAL_CATS.map(cat => ({ name: cat, value: products.filter(p => p.category === cat).length || 0 })).filter(d => d.value > 0);

  const STATUS_COLORS: Record<string, string> = {
    pending_confirmation: "#f59e0b", confirmed: "#C9A84C", processing: "#60a5fa",
    shipped: "#a78bfa", delivered: "#34d399", cancelled: "#f87171",
  };
  const statusBreakdown = Object.entries(
    orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([status, count]) => ({ status, count, pct: orders.length ? Math.round((count / orders.length) * 100) : 0 })).sort((a, b) => b.count - a.count);

  const soldMap: Record<string, { units: number; revenue: number; name: string }> = {};
  orders.forEach(o => {
    (o.items as any[])?.forEach((item: any) => {
      if (!item?.product_id) return;
      if (!soldMap[item.product_id]) soldMap[item.product_id] = { units: 0, revenue: 0, name: item.name ?? "—" };
      soldMap[item.product_id].units += item.quantity ?? 1;
      soldMap[item.product_id].revenue += (item.price ?? 0) * (item.quantity ?? 1);
    });
  });
  const topProducts = Object.entries(soldMap).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
  const maxRev = topProducts[0]?.[1].revenue ?? 1;

  const months6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("default", { month: "short" }) };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C9A84C]/60 font-body mb-1">Admin</p>
          <h1 className="font-heading text-4xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-white/40 font-body mt-1">Store performance at a glance</p>
        </div>
        <Link href="/admin/orders" className="hidden sm:flex items-center gap-2 text-[10px] tracking-widest uppercase text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors font-body">View Orders →</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Revenue"   value={`₦${totalRevenue.toLocaleString()}`} sub="All time"                     icon={DollarSign}  accent="#C9A84C" trend={revTrend} />
        <KPICard label="Total Orders"    value={String(orders.length)}                sub={`${ordThis} this month`}      icon={ShoppingBag} accent="#60a5fa" trend={ordTrend} />
        <KPICard label="Avg Order Value" value={`₦${avgOrder.toLocaleString()}`}      sub="Per transaction"              icon={Activity}    accent="#C4622D" />
        <KPICard label="Customers"       value={String(users.length)}                 sub={`${custThis} new this month`} icon={Users}       accent="#a78bfa" trend={custTrend} />
      </div>

      <div className="rounded-2xl p-5 chart-card" style={CARD_STYLE}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-0.5">Performance</p>
            <p className="font-heading text-xl font-semibold text-white">Revenue & Orders — Last 12 Months</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full bg-[#C9A84C]" /><span className="font-body text-[10px] text-white/40">Revenue</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full bg-[#C4622D]" /><span className="font-body text-[10px] text-white/40">Orders</span></div>
          </div>
        </div>
        <ForexChart data={forexData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl p-5 chart-card" style={CARD_STYLE}>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-0.5">Volume</p>
          <p className="font-heading text-xl font-semibold text-white mb-5">Sales This Week</p>
          <WeeklySalesChart data={weeklySalesData} />
        </div>
        <div className="rounded-2xl p-5 chart-card" style={CARD_STYLE}>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-0.5">Inventory</p>
          <p className="font-heading text-xl font-semibold text-white mb-4">By Category</p>
          <div className="border-t border-white/6 pt-4"><CategoryDonut data={categoryData} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 chart-card" style={CARD_STYLE}>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-0.5">Orders</p>
          <p className="font-heading text-xl font-semibold text-white mb-5">By Status</p>
          {!orders.length ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2"><ShoppingBag size={28} className="text-white/10" /><p className="text-white/25 text-sm font-body">No orders yet</p></div>
          ) : (
            <div className="space-y-4">
              {statusBreakdown.map(({ status, count, pct }) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLORS[status] ?? "#6b7280" }} />
                      <span className="font-body text-xs text-white/65 capitalize">{status.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-[10px] text-white/30">{pct}%</span>
                      <span className="font-body text-xs font-bold text-white">{count}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${STATUS_COLORS[status]}99, ${STATUS_COLORS[status]})`, boxShadow: `0 0 8px ${STATUS_COLORS[status]}60` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5 chart-card" style={CARD_STYLE}>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-0.5">Products</p>
          <p className="font-heading text-xl font-semibold text-white mb-5">Top by Revenue</p>
          {!topProducts.length ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2"><Activity size={28} className="text-white/10" /><p className="text-white/25 text-sm font-body">No sales yet</p></div>
          ) : (
            <div className="space-y-4">
              {topProducts.map(([id, { name, units, revenue }], i) => (
                <div key={id}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-heading text-sm font-bold text-white/20 w-5 shrink-0">#{i + 1}</span>
                    <p className="font-body text-xs text-white/75 truncate font-medium flex-1">{name}</p>
                    <div className="text-right shrink-0">
                      <p className="font-body text-xs font-bold text-[#C9A84C]">₦{revenue.toLocaleString()}</p>
                      <p className="font-body text-[9px] text-white/25">{units} sold</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden ml-8">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.round((revenue / maxRev) * 100)}%`, background: "linear-gradient(90deg, #a8891e, #C9A84C)", boxShadow: "0 0 6px rgba(201,168,76,0.5)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl p-6 chart-card" style={CARD_STYLE}>
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-0.5">Email List</p>
            <p className="font-heading text-xl font-semibold text-white">Subscriber Growth</p>
          </div>
          <p className="font-heading text-4xl font-bold text-[#C9A84C]" style={{ textShadow: "0 0 20px rgba(201,168,76,0.4)" }}>{subs.length}</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {months6.map(({ key, label }) => {
            const count = subs.filter(s => s.created_at?.startsWith(key)).length;
            const maxCount = Math.max(...months6.map(m => subs.filter(s => s.created_at?.startsWith(m.key)).length), 1);
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={key} className="flex flex-col items-center gap-2">
                <div className="w-full rounded-xl overflow-hidden relative" style={{ height: 72, background: "rgba(255,255,255,0.04)" }}>
                  <div className="absolute bottom-0 left-0 right-0 rounded-xl transition-all duration-700"
                    style={{ height: `${Math.max(pct, 4)}%`, background: count > 0 ? "linear-gradient(to top, #a8891e, #C9A84C)" : "rgba(255,255,255,0.06)", boxShadow: count > 0 ? "0 0 12px rgba(201,168,76,0.4)" : "none" }} />
                </div>
                <p className="font-body text-[9px] text-white/30 uppercase tracking-wide">{label}</p>
                <p className="font-heading text-sm font-bold text-white/60">{count}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
