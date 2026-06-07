"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const inputCls = "w-full bg-white/5 border border-white/8 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#C9A84C]/40 transition-all font-body placeholder-white/20";

export default function EditLookbookPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", published: false });

  useEffect(() => {
    createClient().from("lookbook").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setForm({ title: data.title, description: data.description ?? "", published: data.published });
      setLoading(false);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/lookbook/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/admin/lookbook");
  }

  async function handleDelete() {
    if (!confirm("Delete this lookbook? This cannot be undone.")) return;
    await fetch(`/api/lookbook/${id}`, { method: "DELETE" });
    router.push("/admin/lookbook");
  }

  return (
    <div className="max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/lookbook"
          className="w-9 h-9 rounded-xl border border-white/8 flex items-center justify-center text-white/40 hover:bg-white/5 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body">Lookbook</p>
          <h1 className="font-heading text-2xl font-bold text-white">Edit Lookbook</h1>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-sm text-white/30 font-body">Loading…</div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="bg-[#0a0806] border border-white/8 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">Title</label>
              <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="pub" checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="w-4 h-4 accent-[#C9A84C]" />
              <label htmlFor="pub" className="text-sm text-white/60 font-body">Published</label>
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
              🗑 Delete Lookbook
            </button>
          </div>
        </>
      )}
    </div>
  );
}
