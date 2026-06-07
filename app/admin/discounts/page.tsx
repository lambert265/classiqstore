"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Copy } from "lucide-react";

interface Discount {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order: number | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const inputCls = "w-full bg-white/5 border border-white/8 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#C9A84C]/40 transition-all font-body placeholder-white/20";

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "", type: "percentage" as "percentage" | "fixed",
    value: "", min_order: "", max_uses: "", expires_at: "", active: true,
  });

  useEffect(() => {
    createClient().from("discounts").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setDiscounts((data ?? []) as Discount[]);
      setLoading(false);
    });
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const sb = createClient();
    const { data } = await sb.from("discounts").insert({
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      min_order: form.min_order ? Number(form.min_order) : null,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
      active: form.active,
      used_count: 0,
    }).select().single();
    if (data) setDiscounts((prev) => [data as Discount, ...prev]);
    setForm({ code: "", type: "percentage", value: "", min_order: "", max_uses: "", expires_at: "", active: true });
    setShowForm(false);
    setSaving(false);
  }

  async function toggleActive(d: Discount) {
    await createClient().from("discounts").update({ active: !d.active }).eq("id", d.id);
    setDiscounts((prev) => prev.map((x) => x.id === d.id ? { ...x, active: !x.active } : x));
  }

  async function deleteDiscount(id: string) {
    if (!confirm("Delete this discount code?")) return;
    await createClient().from("discounts").delete().eq("id", id);
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-1">Admin</p>
          <h1 className="font-heading text-3xl font-bold text-white">Discounts</h1>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9A84C] text-[#0f0d0b] text-sm font-semibold btn-3d btn-3d-gold font-body">
          <Plus size={15} /> New Code
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#0a0806] border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body">Create Discount Code</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">Code *</label>
              <div className="flex gap-2">
                <input required value={form.code} onChange={set("code")} placeholder="SAVE20" className={inputCls} />
                <button type="button" onClick={() => setForm((f) => ({ ...f, code: genCode() }))}
                  className="px-3 rounded-xl border border-white/8 text-white/30 hover:text-white hover:border-white/20 transition-colors">
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">Type *</label>
              <select value={form.type} onChange={set("type")} className={`${inputCls} bg-[#0a0806]`}>
                <option value="percentage" className="bg-[#0a0806]">Percentage Off (%)</option>
                <option value="fixed" className="bg-[#0a0806]">Fixed Amount (₦)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">
                Value * {form.type === "percentage" ? "(%)" : "(₦)"}
              </label>
              <input required type="number" value={form.value} onChange={set("value")} placeholder={form.type === "percentage" ? "20" : "5000"} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">Min Order (₦)</label>
              <input type="number" value={form.min_order} onChange={set("min_order")} placeholder="Optional" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">Max Uses</label>
              <input type="number" value={form.max_uses} onChange={set("max_uses")} placeholder="Unlimited" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">Expires At</label>
              <input type="date" value={form.expires_at} onChange={set("expires_at")} className={inputCls} />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <input type="checkbox" id="active" checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="w-4 h-4 accent-[#C9A84C]" />
              <label htmlFor="active" className="text-sm text-white/60 font-body">Active immediately</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#C9A84C] text-[#0f0d0b] font-semibold text-sm btn-3d btn-3d-gold font-body disabled:opacity-60">
              {saving ? "Saving…" : "Create Code"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-xl border border-white/8 text-white/40 text-sm font-body hover:text-white hover:border-white/20 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#0a0806] border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-sm text-white/30 font-body">Loading…</div>
        ) : discounts.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-sm text-white/30 font-body">No discount codes yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-white/6">
                  {["Code", "Type", "Value", "Min Order", "Uses", "Expires", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[9px] tracking-[0.2em] uppercase text-white/25 font-normal font-body">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d.id} className="border-b border-white/4 last:border-0 hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-[#C9A84C] font-bold">{d.code}</td>
                    <td className="px-5 py-3 text-white/40 text-xs font-body capitalize">{d.type}</td>
                    <td className="px-5 py-3 text-white/70 font-body">
                      {d.type === "percentage" ? `${d.value}%` : fmt(d.value)}
                    </td>
                    <td className="px-5 py-3 text-white/40 text-xs font-body">{d.min_order ? fmt(d.min_order) : "—"}</td>
                    <td className="px-5 py-3 text-white/40 text-xs font-body">
                      {d.used_count}{d.max_uses ? ` / ${d.max_uses}` : ""}
                    </td>
                    <td className="px-5 py-3 text-white/30 text-xs font-body">
                      {d.expires_at ? new Date(d.expires_at).toLocaleDateString("en-NG") : "Never"}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleActive(d)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border font-body transition-colors ${
                          d.active
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-white/5 text-white/30 border-white/10 hover:border-white/20"
                        }`}>
                        {d.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => deleteDiscount(d.id)}
                        className="w-7 h-7 rounded-lg border border-white/8 flex items-center justify-center text-white/25 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
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
