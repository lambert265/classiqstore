"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download, Mail } from "lucide-react";

interface Sub { id: string; email: string; created_at: string; }

export default function SubscribersPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createClient().from("subscribers").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setSubs(data ?? []);
      setLoading(false);
    });
  }, []);

  function exportCSV() {
    const rows = subs.map((s) => [s.email, new Date(s.created_at).toLocaleDateString("en-NG")].join(","));
    const csv = ["Email,Joined", ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `subscribers-${Date.now()}.csv`;
    a.click();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-1">Admin</p>
            <h1 className="font-heading text-3xl font-bold text-white">Subscribers</h1>
          </div>
          <span className="px-3 py-1 bg-[#C9A84C]/15 border border-[#C9A84C]/20 text-[#C9A84C] text-sm font-bold rounded-full font-heading mt-4">
            {subs.length}
          </span>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:border-white/25 hover:text-white transition-colors text-sm font-body btn-3d">
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="bg-[#0a0806] border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-sm text-white/30 font-body">Loading…</div>
        ) : subs.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center gap-2 text-white/25">
            <Mail size={28} strokeWidth={1.2} />
            <p className="text-sm font-body">No subscribers yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                {["#", "Email", "Joined"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[9px] tracking-[0.2em] uppercase text-white/25 font-normal font-body">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subs.map((s, i) => (
                <tr key={s.id} className="border-b border-white/4 last:border-0 hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-3 text-white/25 text-xs font-body">{i + 1}</td>
                  <td className="px-5 py-3 text-white/70 font-body">{s.email}</td>
                  <td className="px-5 py-3 text-white/30 text-xs font-body">{new Date(s.created_at).toLocaleDateString("en-NG")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
