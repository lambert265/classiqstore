"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Zap, Trash2, Pencil, Search } from "lucide-react";
import Link from "next/link";
import type { Product, ProductCategory } from "@/lib/types";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "beanie", label: "Beanie" },
  { value: "skirt", label: "Skirt" },
  { value: "set", label: "Set" },
  { value: "bag", label: "Bag" },
  { value: "accessory", label: "Accessory" },
  { value: "shorts", label: "Shorts" },
  { value: "baby_wear", label: "Baby Wear" },
];

const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function StockBadge({ count }: { count: number }) {
  if (count === 0) return <span className="text-[10px] font-semibold text-red-400">Out of stock</span>;
  if (count <= 5) return <span className="text-[10px] font-semibold text-amber-400">{count} left</span>;
  return <span className="text-[10px] font-semibold text-emerald-400">{count} in stock</span>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const sb = createClient();
    let q = sb.from("products").select("*").order("created_at", { ascending: false });
    if (category !== "all") q = q.eq("category", category as ProductCategory);
    const { data } = await q;
    setProducts((data ?? []) as Product[]);
    setLoading(false);
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function toggleFlashSale(p: Product) {
    await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ is_flash_sale: !p.is_flash_sale }),
    });
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, is_flash_sale: !x.is_flash_sale } : x));
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-1">Admin</p>
          <h1 className="font-heading text-3xl font-bold text-white">Products</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/flash-sale"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors btn-3d font-body">
            <Zap size={14} /> Flash Sale
          </Link>
          <Link href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9A84C] text-[#0f0d0b] text-sm font-semibold btn-3d btn-3d-gold font-body">
            <Plus size={15} /> Add Product
          </Link>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2 focus-within:border-[#C9A84C]/40 transition-colors">
          <Search size={14} className="text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
            className="bg-transparent text-sm text-white/70 outline-none w-40 placeholder:text-white/20 font-body" />
        </div>
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setCategory(c.value)}
            className={`px-3 py-2 rounded-xl text-[10px] tracking-wide uppercase font-body border btn-3d transition-colors ${
              category === c.value
                ? "bg-[#C9A84C] text-[#0f0d0b] border-[#C9A84C]"
                : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/70"
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-sm text-white/30 font-body">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-sm text-white/30 font-body">No products found</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-[#0a0806] rounded-2xl border border-white/8 overflow-hidden group card-hover">
              <div className="aspect-square bg-white/4 relative">
                {p.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                )}
                {p.is_flash_sale && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-[#0f0d0b] text-[10px] font-bold rounded-full flex items-center gap-1">
                    <Zap size={9} /> Sale
                  </span>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/products/${p.id}`}
                    className="w-7 h-7 bg-[#0a0806] rounded-lg flex items-center justify-center border border-white/10 text-white/50 hover:text-[#C9A84C] transition-colors">
                    <Pencil size={13} />
                  </Link>
                  <button onClick={() => deleteProduct(p.id)}
                    className="w-7 h-7 bg-[#0a0806] rounded-lg flex items-center justify-center border border-white/10 text-white/50 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="p-3 flex flex-col gap-1.5">
                <p className="text-xs font-semibold text-white/80 line-clamp-1 font-body">{p.name}</p>
                <p className="text-[10px] text-white/35 capitalize font-body">{p.category.replace(/_/g, " ")}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#C9A84C] font-heading">{fmt(p.price)}</span>
                  <StockBadge count={p.stock_count} />
                </div>
                <button onClick={() => toggleFlashSale(p)}
                  className={`w-full py-1.5 rounded-lg text-[10px] font-semibold transition-colors border font-body btn-3d ${
                    p.is_flash_sale
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                      : "bg-white/4 border-white/8 text-white/40 hover:bg-[#C9A84C]/10 hover:border-[#C9A84C]/20 hover:text-[#C9A84C]"
                  }`}>
                  {p.is_flash_sale ? "⚡ Remove Flash Sale" : "Add to Flash Sale"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
