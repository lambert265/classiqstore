"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import type { LookbookEntry } from "@/lib/types";

export default function LookbookPage() {
  const [entries, setEntries] = useState<LookbookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createClient().from("lookbook").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setEntries((data ?? []) as LookbookEntry[]);
      setLoading(false);
    });
  }, []);

  async function togglePublish(e: LookbookEntry) {
    await fetch(`/api/lookbook/${e.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ published: !e.published }),
    });
    setEntries((prev) => prev.map((x) => x.id === e.id ? { ...x, published: !x.published } : x));
  }

  async function deleteEntry(id: string) {
    if (!confirm("Delete this lookbook?")) return;
    await fetch(`/api/lookbook/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-1">Admin</p>
          <h1 className="font-heading text-3xl font-bold text-white">Lookbook</h1>
        </div>
        <Link href="/admin/lookbook/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9A84C] text-[#0f0d0b] text-sm font-semibold btn-3d btn-3d-gold font-body">
          <Plus size={15} /> New Lookbook
        </Link>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-sm text-white/30 font-body">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-sm text-white/30 font-body">No lookbooks yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((e) => (
            <div key={e.id} className="bg-[#0a0806] rounded-2xl border border-white/8 overflow-hidden card-hover">
              <div className="aspect-video bg-white/4 relative overflow-hidden">
                {e.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.images[0]} alt={e.title} className="w-full h-full object-cover" />
                )}
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold font-body ${
                  e.published ? "bg-emerald-500 text-white" : "bg-white/15 text-white/60"
                }`}>
                  {e.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="p-4 flex flex-col gap-2">
                <p className="font-semibold text-white/80 line-clamp-1 font-body">{e.title}</p>
                {e.description && <p className="text-xs text-white/35 line-clamp-2 font-body">{e.description}</p>}
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => togglePublish(e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border btn-3d transition-colors font-body ${
                      e.published
                        ? "bg-white/5 border-white/10 text-white/40 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                    }`}>
                    {e.published ? <><EyeOff size={11} /> Unpublish</> : <><Eye size={11} /> Publish</>}
                  </button>
                  <Link href={`/admin/lookbook/${e.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 text-white/40 hover:bg-white/5 hover:text-white transition-colors btn-3d font-body">
                    <Pencil size={11} /> Edit
                  </Link>
                  <button onClick={() => deleteEntry(e.id)}
                    className="ml-auto w-7 h-7 rounded-lg border border-white/8 flex items-center justify-center text-white/25 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
