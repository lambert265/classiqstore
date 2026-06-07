import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { revalidatePath } from "next/cache";

const STATUS_STYLE: Record<string, string> = {
  pending_confirmation: "bg-yellow-500/15 text-yellow-300 border-yellow-500/20",
  confirmed:   "bg-green-500/15 text-green-300 border-green-500/20",
  processing:  "bg-blue-500/15 text-blue-300 border-blue-500/20",
  shipped:     "bg-purple-500/15 text-purple-300 border-purple-500/20",
  delivered:   "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  cancelled:   "bg-red-500/15 text-red-300 border-red-500/20",
};
const STATUSES = ["pending_confirmation","confirmed","processing","shipped","delivered","cancelled"];

async function getClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll(s) { try { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } }
  );
}

async function confirmOrder(formData: FormData) {
  "use server";
  const sb = await getClient();
  await sb.from("orders").update({ status: "confirmed" }).eq("id", formData.get("id") as string);
  revalidatePath("/admin/orders"); revalidatePath("/admin/dashboard");
}
async function deleteOrder(formData: FormData) {
  "use server";
  const sb = await getClient();
  await sb.from("orders").delete().eq("id", formData.get("id"));
  revalidatePath("/admin/orders"); revalidatePath("/admin/dashboard");
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const sb = await getClient();
  let query = sb.from("orders").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data: allOrders } = await query;

  const orders = q
    ? (allOrders ?? []).filter(o => {
        const name = (o.shipping_address as { full_name?: string })?.full_name?.toLowerCase() ?? "";
        const s = q.toLowerCase();
        return name.includes(s) || o.id.toLowerCase().includes(s);
      })
    : (allOrders ?? []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-1">Admin</p>
        <h1 className="font-heading text-3xl font-bold text-white">Orders</h1>
      </div>

      <a href="/api/orders/export" download
        className="inline-block text-[10px] tracking-wide uppercase px-4 py-2 rounded-full border border-white/10 text-white/40 hover:border-white/30 hover:text-white transition-all font-body btn-3d">
        ↓ Export CSV
      </a>

      <div className="flex gap-2 flex-wrap">
        {[{ label: "All", value: "" }, ...STATUSES.map(s => ({ label: s.replace(/_/g, " "), value: s }))].map(f => (
          <Link key={f.value} href={f.value ? `/admin/orders?status=${f.value}` : "/admin/orders"}
            className={`text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-full border btn-3d ${
              (status ?? "") === f.value ? "bg-[#C9A84C] text-[#0f0d0b] border-[#C9A84C]" : "border-white/10 text-white/40"
            }`}>
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6">
          <p className="text-sm text-white/40 font-body">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        </div>
        {!orders.length ? (
          <div className="text-center py-16 text-white/30 text-sm font-body">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-white/6">
                  {["Order ID","Customer","Items","Total","Status","Date","Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[9px] tracking-[0.2em] uppercase text-white/25 font-normal font-body">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-white/4 last:border-0 hover:bg-white/4 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-white/40 hover:text-white transition-colors">
                        {o.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-white/60 text-xs font-body">{(o.shipping_address as { full_name?: string })?.full_name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-white/40 text-xs font-body">{Array.isArray(o.items) ? o.items.length : "—"}</td>
                    <td className="px-5 py-3.5 text-white/70 font-medium font-body">₦{o.total_amount?.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full border font-body ${STATUS_STYLE[o.status] ?? "bg-white/8 text-white/40 border-white/10"}`}>
                        {o.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-white/30 text-xs font-body">{new Date(o.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {o.status === "pending_confirmation" && (
                          <form action={confirmOrder}>
                            <input type="hidden" name="id" value={o.id} />
                            <button type="submit" className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg border border-[#C9A84C]/30 text-[#C9A84C]/70 btn-3d font-body">
                              Confirm
                            </button>
                          </form>
                        )}
                        <Link href={`/admin/orders/${o.id}`} className="text-[10px] bg-white/6 border border-white/10 text-white/50 px-2.5 py-1.5 rounded-lg btn-3d font-body">
                          Manage
                        </Link>
                        <form action={deleteOrder}>
                          <input type="hidden" name="id" value={o.id} />
                          <button type="submit" className="text-[10px] px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 btn-3d btn-3d-red font-body">✕</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
