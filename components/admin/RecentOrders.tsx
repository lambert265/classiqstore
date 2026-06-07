import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type OrderStatus = "Shipped" | "Processing" | "Delivered" | "Pending";

export interface RecentOrder {
  id: string;
  customer: string;
  item: string;
  amount: number;
  status: OrderStatus;
  rawStatus: string;
}

const STATUS_PILL: Record<string, { bg: string; text: string; border: string }> = {
  Shipped:    { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/20" },
  Processing: { bg: "bg-amber-500/10",   text: "text-amber-300",   border: "border-amber-500/20"   },
  Delivered:  { bg: "bg-blue-500/10",    text: "text-blue-300",    border: "border-blue-500/20"    },
  Pending:    { bg: "bg-yellow-500/10",  text: "text-yellow-300",  border: "border-yellow-500/20"  },
};

async function confirmOrder(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("orders").update({ status: "confirmed" }).eq("id", formData.get("id") as string);
  revalidatePath("/dashboard");
  revalidatePath("/orders");
}

export default function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-sm border border-white/8 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <p className="font-heading text-lg font-semibold text-white">Recent Orders</p>
        </div>
        <Link href="/admin/orders" className="text-[10px] tracking-widest uppercase text-[#6b9e7e] hover:text-[#4ade80] transition-colors font-body">
          View All →
        </Link>
      </div>

      {!orders.length ? (
        <div className="text-center py-12 text-white/25 text-sm font-body">No orders yet</div>
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm min-w-[580px]">
              <thead>
                <tr className="border-b border-white/5">
                  {["Order ID", "Customer", "Item", "Amount", "Status", ""].map((col, i) => (
                    <th key={i} className="text-left px-5 py-3 text-[9px] tracking-[0.2em] uppercase text-white/20 font-normal font-body">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const pill = STATUS_PILL[o.status] ?? STATUS_PILL.Pending;
                  return (
                    <tr key={o.id} className="border-b border-white/4 last:border-0 hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-white/30">#{o.id.slice(0,8).toUpperCase()}</td>
                      <td className="px-5 py-3 text-white/70 text-xs font-body max-w-[120px] truncate">{o.customer}</td>
                      <td className="px-5 py-3 text-white/50 text-xs font-body max-w-[100px] truncate">{o.item}</td>
                      <td className="px-5 py-3 text-[#4ade80] font-semibold text-xs font-body">₦{o.amount.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex text-[10px] px-2.5 py-1 rounded-full border font-body ${pill.bg} ${pill.text} ${pill.border}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {o.rawStatus === "pending_confirmation" && (
                          <form action={confirmOrder}>
                            <input type="hidden" name="id" value={o.id} />
                            <button type="submit"
                              className="text-[10px] font-body px-2.5 py-1 rounded-lg border border-emerald-500/30 text-emerald-400/70 btn-3d">
                              Confirm
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden divide-y divide-white/4">
            {orders.map(o => {
              const pill = STATUS_PILL[o.status] ?? STATUS_PILL.Pending;
              return (
                <div key={o.id} className="px-4 py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-white/30">#{o.id.slice(0,8).toUpperCase()}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-body ${pill.bg} ${pill.text} ${pill.border}`}>{o.status}</span>
                    </div>
                    <p className="text-sm text-white/70 font-body truncate">{o.customer}</p>
                    <p className="text-xs text-white/40 font-body truncate">{o.item}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-[#4ade80] font-body">₦{o.amount.toLocaleString()}</p>
                    {o.rawStatus === "pending_confirmation" && (
                      <form action={confirmOrder} className="mt-1">
                        <input type="hidden" name="id" value={o.id} />
                        <button type="submit"
                          className="text-[10px] font-body px-2.5 py-1 rounded-lg border border-emerald-500/30 text-emerald-400/70 btn-3d">
                          Confirm
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
