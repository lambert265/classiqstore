"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CustomRequest, CustomRequestStatus } from "@/lib/types";

const STATUSES = ["all", "pending", "in_progress", "quoted", "accepted", "completed"];
const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const STATUS_PILL: Record<string, string> = {
  pending:     "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  quoted:      "bg-purple-500/10 text-purple-300 border-purple-500/20",
  accepted:    "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  completed:   "bg-white/8 text-white/40 border-white/10",
};

export default function CustomRequestsPage() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [filter, setFilter] = useState("all");
  const [quotes, setQuotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const sb = createClient();
    let q = sb.from("custom_requests").select("*, profiles(full_name, email)").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setRequests((data ?? []) as CustomRequest[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function sendQuote(id: string) {
    const amount = quotes[id];
    if (!amount) return;
    await fetch(`/api/custom-requests/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ quote_amount: Number(amount) }),
    });
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "quoted" as CustomRequestStatus, quote_amount: Number(amount) } : r));
    setQuotes((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  async function updateStatus(id: string, status: CustomRequestStatus) {
    await fetch(`/api/custom-requests/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-1">Admin</p>
        <h1 className="font-heading text-3xl font-bold text-white">Custom Requests</h1>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-[10px] tracking-wide uppercase font-body border btn-3d transition-colors ${
              filter === s
                ? "bg-[#C9A84C] text-[#0f0d0b] border-[#C9A84C]"
                : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/70"
            }`}>
            {s === "all" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-sm text-white/30 font-body">Loading…</div>
      ) : requests.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-sm text-white/30 font-body">No requests found</div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((r) => (
            <div key={r.id} className="bg-[#0a0806] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 card-hover">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-white font-body">{r.profiles?.full_name ?? "Unknown"}</p>
                  <p className="text-xs text-white/35 font-body mt-0.5">{r.profiles?.email} · {new Date(r.created_at).toLocaleDateString("en-NG")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full border font-body ${STATUS_PILL[r.status] ?? STATUS_PILL.pending}`}>
                    {r.status.replace(/_/g, " ")}
                  </span>
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value as CustomRequestStatus)}
                    className="text-xs border border-white/8 rounded-lg px-2 py-1.5 bg-white/5 text-white/60 outline-none focus:border-[#C9A84C]/40 font-body">
                    {["pending", "in_progress", "quoted", "accepted", "completed"].map((s) => (
                      <option key={s} value={s} className="bg-[#0a0806]">{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              </div>

              {r.product_type && <p className="text-sm font-medium text-[#C9A84C] capitalize font-body">{r.product_type}</p>}
              {r.description && <p className="text-sm text-white/50 leading-relaxed font-body">{r.description}</p>}

              {r.reference_images?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {r.reference_images.map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={img} alt="ref" className="w-16 h-16 rounded-xl object-cover border border-white/8" />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2 border-t border-white/6 flex-wrap">
                {r.quote_amount ? (
                  <p className="text-sm font-semibold text-emerald-400 font-body">Quoted: {fmt(r.quote_amount)}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={quotes[r.id] ?? ""}
                      onChange={(e) => setQuotes((q) => ({ ...q, [r.id]: e.target.value }))}
                      placeholder="Quote amount (₦)"
                      className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#C9A84C]/40 w-44 font-body placeholder-white/20"
                    />
                    <button onClick={() => sendQuote(r.id)} disabled={!quotes[r.id]}
                      className="px-4 py-2 rounded-xl bg-[#C9A84C] text-[#0f0d0b] text-sm font-semibold btn-3d btn-3d-gold font-body disabled:opacity-40">
                      Send Quote
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
