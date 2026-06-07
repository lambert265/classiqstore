"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["beanie", "skirt", "set", "bag", "accessory", "shorts", "baby_wear"];
const fmtLabel = (v: string) => v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const inputCls = "w-full bg-white/5 border border-white/8 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#C9A84C]/40 transition-all font-body placeholder-white/20";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "", price: "", stock_count: "", category: "beanie",
    description: "", is_flash_sale: false, flash_sale_price: "",
  });

  useEffect(() => {
    createClient().from("products").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setForm({
        name: data.name, price: String(data.price), stock_count: String(data.stock_count),
        category: data.category, description: data.description ?? "",
        is_flash_sale: data.is_flash_sale, flash_sale_price: data.flash_sale_price ? String(data.flash_sale_price) : "",
      });
      setLoading(false);
    });
  }, [id]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form, price: Number(form.price), stock_count: Number(form.stock_count),
        flash_sale_price: form.flash_sale_price ? Number(form.flash_sale_price) : null,
      }),
    });
    router.push("/admin/products");
  }

  async function handleDelete() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.push("/admin/products");
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/products"
          className="w-9 h-9 rounded-xl border border-white/8 flex items-center justify-center text-white/40 hover:bg-white/5 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body">Products</p>
          <h1 className="font-heading text-2xl font-bold text-white">Edit Product</h1>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-sm text-white/30 font-body">Loading…</div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="bg-[#0a0806] border border-white/8 rounded-2xl p-6 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">Product Name</label>
                <input required value={form.name} onChange={set("name")} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">Price (₦)</label>
                <input type="number" value={form.price} onChange={set("price")} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">Stock Count</label>
                <input type="number" value={form.stock_count} onChange={set("stock_count")} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">Category</label>
                <select value={form.category} onChange={set("category")} className={`${inputCls} bg-[#0a0806]`}>
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0a0806]">{fmtLabel(c)}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">Flash Sale Price (₦)</label>
                <input type="number" value={form.flash_sale_price} onChange={set("flash_sale_price")} placeholder="Optional" className={inputCls} />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">Description</label>
                <textarea value={form.description} onChange={set("description") as React.ChangeEventHandler<HTMLTextAreaElement>}
                  rows={3} className={`${inputCls} resize-none`} />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <input type="checkbox" id="flash" checked={form.is_flash_sale}
                  onChange={(e) => setForm((f) => ({ ...f, is_flash_sale: e.target.checked }))}
                  className="w-4 h-4 accent-[#C9A84C]" />
                <label htmlFor="flash" className="text-sm text-white/60 font-body">Enable Flash Sale</label>
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-3 rounded-xl bg-[#C9A84C] text-[#0f0d0b] font-semibold text-sm btn-3d btn-3d-gold font-body disabled:opacity-60">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>

          <div className="bg-[#0a0806] border border-red-500/15 rounded-2xl p-5">
            <p className="text-[10px] tracking-widest uppercase text-red-400/50 font-body mb-4">Danger Zone</p>
            <button onClick={handleDelete}
              className="text-sm font-body px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400/70 hover:border-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
              🗑 Delete Product
            </button>
          </div>
        </>
      )}
    </div>
  );
}
