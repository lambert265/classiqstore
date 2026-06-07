"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/types";

const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export default function FlashSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [salePrice, setSalePrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createClient().from("products").select("*").order("name").then(({ data }) => {
      setProducts((data ?? []) as Product[]);
      setLoading(false);
    });
  }, []);

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  async function activate() {
    if (!selected.length) return;
    setSaving(true);
    await fetch("/api/flash-sale", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productIds: selected, activate: true, flashSalePrice: salePrice ? Number(salePrice) : undefined }),
    });
    setProducts((prev) => prev.map((p) => selected.includes(p.id) ? { ...p, is_flash_sale: true } : p));
    setSelected([]);
    setSaving(false);
  }

  async function deactivate() {
    if (!selected.length) return;
    setSaving(true);
    await fetch("/api/flash-sale", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productIds: selected, activate: false }),
    });
    setProducts((prev) => prev.map((p) => selected.includes(p.id) ? { ...p, is_flash_sale: false } : p));
    setSelected([]);
    setSaving(false);
  }

  return (
    <div className="max-w-3xl flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/products"
          className="w-9 h-9 rounded-xl border border-white/8 flex items-center justify-center text-white/40 hover:bg-white/5 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body">Products</p>
          <h1 className="font-heading text-2xl font-bold text-white">Flash Sale Manager</h1>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 flex-wrap">
          <span className="text-sm font-semibold text-amber-400 font-body">
            {selected.length} product{selected.length > 1 ? "s" : ""} selected
          </span>
          <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)}
            placeholder="Flash price (₦) — optional"
            className="bg-white/5 border border-amber-500/20 rounded-xl px-3 py-1.5 text-sm text-white outline-none focus:border-amber-400/60 w-48 font-body placeholder-white/20" />
          <button onClick={activate} disabled={saving}
            className="px-4 py-2 rounded-xl bg-amber-500 text-[#0f0d0b] text-sm font-semibold hover:bg-amber-400 transition-colors disabled:opacity-60 flex items-center gap-1.5 btn-3d font-body">
            <Zap size={13} /> Activate
          </button>
          <button onClick={deactivate} disabled={saving}
            className="px-4 py-2 rounded-xl bg-white/8 border border-white/10 text-white/60 text-sm font-semibold hover:bg-white/12 transition-colors disabled:opacity-60 btn-3d font-body">
            Deactivate
          </button>
        </div>
      )}

      <div className="bg-[#0a0806] border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-sm text-white/30 font-body">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                <th className="px-5 py-3 w-10">
                  <input type="checkbox" onChange={(e) => setSelected(e.target.checked ? products.map((p) => p.id) : [])} className="accent-[#C9A84C]" />
                </th>
                {["Product", "Price", "Sale Price", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[9px] tracking-[0.2em] uppercase text-white/25 font-normal font-body">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/4 last:border-0 hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-3">
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} className="accent-[#C9A84C]" />
                  </td>
                  <td className="px-4 py-3 text-white/70 font-body">{p.name}</td>
                  <td className="px-4 py-3 text-white/50 font-body">{fmt(p.price)}</td>
                  <td className="px-4 py-3 text-white/50 font-body">{p.flash_sale_price ? fmt(p.flash_sale_price) : "—"}</td>
                  <td className="px-4 py-3">
                    {p.is_flash_sale
                      ? <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 font-body"><Zap size={11} /> Active</span>
                      : <span className="text-xs text-white/25 font-body">Inactive</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
