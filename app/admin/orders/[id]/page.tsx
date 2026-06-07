import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

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

async function updateStatus(formData: FormData) {
  "use server";
  const sb = await getClient();
  const id = formData.get("id") as string;
  await sb.from("orders").update({ status: formData.get("status") }).eq("id", id);
  revalidatePath(`/admin/orders/${id}`); revalidatePath("/admin/orders");
}
async function saveAdminNote(formData: FormData) {
  "use server";
  const sb = await getClient();
  const id = formData.get("id") as string;
  await sb.from("orders").update({ admin_notes: formData.get("admin_notes") }).eq("id", id);
  revalidatePath(`/admin/orders/${id}`);
}
async function deleteOrder(formData: FormData) {
  "use server";
  const sb = await getClient();
  await sb.from("orders").delete().eq("id", formData.get("id"));
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await getClient();
  const { data: order } = await sb.from("orders").select("*").eq("id", id).single();
  if (!order) notFound();

  const addr = (order.shipping_address as { full_name?: string; street?: string; city?: string; state?: string; phone?: string }) ?? {};
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-white/30 hover:text-white transition-colors text-sm font-body">← Orders</Link>
        <span className="text-white/10">/</span>
        <p className="font-mono text-sm text-white/40">{order.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-1">Order Detail</p>
          <h1 className="font-heading text-3xl font-bold text-white">#{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-white/40 font-body mt-1">
            {new Date(order.created_at).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className={`text-sm px-4 py-2 rounded-full border font-body ${STATUS_STYLE[order.status] ?? "bg-white/8 text-white/40 border-white/10"}`}>
          {order.status?.replace(/_/g, " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#0a0806] border border-white/6 rounded-2xl p-5">
          <p className="text-[10px] tracking-widest uppercase text-[#C9A84C]/60 font-body mb-3">Customer</p>
          <p className="text-white font-medium font-body">{addr.full_name ?? "—"}</p>
          <p className="text-white/40 text-sm font-body mt-1">{addr.street}</p>
          <p className="text-white/40 text-sm font-body">{addr.city}, {addr.state}</p>
          {addr.phone && <p className="text-white/40 text-sm font-body">{addr.phone}</p>}
        </div>
        <div className="bg-[#0a0806] border border-white/6 rounded-2xl p-5">
          <p className="text-[10px] tracking-widest uppercase text-[#C9A84C]/60 font-body mb-3">Payment</p>
          <p className="text-2xl font-bold text-[#C9A84C] font-heading">₦{order.total_amount?.toLocaleString()}</p>
          {order.order_notes && <p className="text-white/40 text-sm font-body mt-2 bg-white/4 rounded-xl px-3 py-2">📝 {order.order_notes}</p>}
        </div>
      </div>

      {items.length > 0 && (
        <div className="bg-[#0a0806] border border-white/6 rounded-2xl overflow-hidden">
          <p className="text-[10px] tracking-widest uppercase text-[#C9A84C]/60 font-body px-5 py-4 border-b border-white/6">Items ({items.length})</p>
          <div className="divide-y divide-white/4">
            {items.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-white/80 text-sm font-medium font-body">{item.name}</p>
                  <p className="text-white/40 text-xs font-body mt-0.5">{item.color && `${item.color} · `}{item.size} · ×{item.quantity}</p>
                </div>
                <p className="text-[#C9A84C] text-sm font-semibold font-body">₦{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#0a0806] border border-white/6 rounded-2xl p-5">
        <p className="text-[10px] tracking-widest uppercase text-[#C9A84C]/60 font-body mb-4">Admin Notes</p>
        <form action={saveAdminNote} className="space-y-3">
          <input type="hidden" name="id" value={order.id} />
          <textarea name="admin_notes" rows={3} defaultValue={(order as any).admin_notes ?? ""}
            placeholder="Internal notes — not visible to customer..."
            className="w-full bg-white/5 border border-white/8 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#C9A84C]/40 transition-all font-body placeholder-white/20 resize-none" />
          <button type="submit" className="text-[10px] font-body px-4 py-2 rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/20 hover:border-[#C9A84C]/50 transition-all btn-3d">
            Save Note
          </button>
        </form>
      </div>

      <div className="bg-[#0a0806] border border-white/6 rounded-2xl p-5">
        <p className="text-[10px] tracking-widest uppercase text-[#C9A84C]/60 font-body mb-4">Update Status</p>
        <form action={updateStatus} className="flex gap-3">
          <input type="hidden" name="id" value={order.id} />
          <select name="status" defaultValue={order.status}
            className="flex-1 bg-white/5 border border-white/8 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#C9A84C]/40 text-sm font-body">
            {STATUSES.map(s => <option key={s} value={s} className="bg-[#0a0806]">{s.replace(/_/g, " ")}</option>)}
          </select>
          <button type="submit" className="bg-[#C9A84C] text-[#0f0d0b] font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-[#a8891e] transition-all font-body btn-3d btn-3d-gold">
            Save
          </button>
        </form>
      </div>

      <div className="bg-[#0a0806] border border-red-500/15 rounded-2xl p-5">
        <p className="text-[10px] tracking-widest uppercase text-red-400/50 font-body mb-4">Danger Zone</p>
        <form action={deleteOrder}>
          <input type="hidden" name="id" value={order.id} />
          <button type="submit" className="text-sm font-body px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400/70 hover:border-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
            🗑 Delete Order
          </button>
        </form>
      </div>
    </div>
  );
}
