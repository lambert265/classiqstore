"use client";
import { useState, useTransition } from "react";
import { CheckSquare, Square, Trash2, Star, StarOff, Package } from "lucide-react";

interface Product { id: string; name: string; is_featured: boolean; stock_count: number; }

export default function BulkProductActions({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState("");

  const allSelected = selected.size === products.length && products.length > 0;

  function toggleAll() { setSelected(allSelected ? new Set() : new Set(products.map(p => p.id))); }
  function toggle(id: string) {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  async function bulkAction(action: string) {
    if (!selected.size) return;
    startTransition(async () => {
      await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action }),
      });
      setDone(`${action} applied to ${selected.size} product${selected.size > 1 ? "s" : ""}`);
      setSelected(new Set());
      setTimeout(() => { setDone(""); window.location.reload(); }, 1500);
    });
  }

  return (
    <div className="space-y-4">
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-2xl px-4 py-3 flex-wrap">
          <span className="font-body text-xs text-[#C9A84C] font-semibold">{selected.size} selected</span>
          <div className="flex gap-2 flex-wrap">
            {[
              { action: "feature",     label: "Feature",          icon: Star,     cls: "border-amber-400/30 text-amber-300/70 hover:border-amber-400 hover:text-amber-300" },
              { action: "unfeature",   label: "Unfeature",        icon: StarOff,  cls: "border-white/10 text-white/40 hover:border-white/30 hover:text-white" },
              { action: "out_of_stock",label: "Mark Out of Stock", icon: Package,  cls: "border-orange-400/30 text-orange-300/70 hover:border-orange-400 hover:text-orange-300" },
              { action: "delete",      label: "Delete",           icon: Trash2,   cls: "border-red-500/30 text-red-400/70 hover:border-red-400 hover:text-red-300 btn-3d-red" },
            ].map(({ action, label, icon: Icon, cls }) => (
              <button key={action} onClick={() => bulkAction(action)} disabled={isPending}
                className={`flex items-center gap-1.5 text-[10px] font-body px-3 py-1.5 rounded-lg border btn-3d transition-all ${cls}`}>
                <Icon size={11} /> {label}
              </button>
            ))}
          </div>
          {done && <span className="font-body text-[10px] text-[#C9A84C] ml-auto">{done}</span>}
        </div>
      )}

      <div className="flex items-center gap-3 px-1">
        <button onClick={toggleAll} className="text-white/40 hover:text-white transition-colors">
          {allSelected ? <CheckSquare size={16} className="text-[#C9A84C]" /> : <Square size={16} />}
        </button>
        <span className="font-body text-[10px] tracking-[0.15em] uppercase text-white/25">
          {allSelected ? "Deselect all" : "Select all"}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {products.map(p => (
          <label key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-colors">
            <button type="button" onClick={() => toggle(p.id)} className="text-white/40 hover:text-white transition-colors shrink-0">
              {selected.has(p.id) ? <CheckSquare size={15} className="text-[#C9A84C]" /> : <Square size={15} />}
            </button>
            <span className="font-body text-sm text-white/70 flex-1 truncate">{p.name}</span>
            <span className={`font-body text-[10px] px-2 py-0.5 rounded-full border ${
              p.stock_count === 0 ? "bg-red-500/10 text-red-400 border-red-500/20"
              : p.is_featured ? "bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20"
              : "bg-white/5 text-white/25 border-white/8"
            }`}>
              {p.stock_count === 0 ? "Out" : p.is_featured ? "Featured" : `${p.stock_count} left`}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
