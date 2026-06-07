"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Download } from "lucide-react";

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  order_count: number;
  lifetime_value: number;
}

const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const [{ data: profiles }, { data: orders }] = await Promise.all([
        sb.from("profiles").select("id,full_name,email,created_at").eq("is_admin", false).order("created_at", { ascending: false }),
        sb.from("orders").select("user_id,total_amount"),
      ]);
      const rows: UserRow[] = (profiles ?? []).map((p) => {
        const userOrders = (orders ?? []).filter((o: { user_id: string }) => o.user_id === p.id);
        return { ...p, order_count: userOrders.length, lifetime_value: userOrders.reduce((s: number, o: { total_amount: number }) => s + o.total_amount, 0) };
      });
      setUsers(rows);
      setLoading(false);
    })();
  }, []);

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function exportCSV() {
    const rows = users.map((u) => [u.id, u.full_name ?? "", u.email ?? "", u.order_count, u.lifetime_value, new Date(u.created_at).toLocaleDateString("en-NG")].join(","));
    const csv = ["ID,Name,Email,Orders,Lifetime Value,Joined", ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `users-${Date.now()}.csv`;
    a.click();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-1">Admin</p>
          <h1 className="font-heading text-3xl font-bold text-white">
            Users <span className="text-white/25 text-2xl font-normal">({users.length})</span>
          </h1>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:border-white/25 hover:text-white transition-colors text-sm font-body btn-3d">
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="bg-[#0a0806] border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-sm text-white/30 font-body">Loading…</div>
        ) : users.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-sm text-white/30 font-body">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  {["Name", "Email", "Orders", "Lifetime Value", "Joined", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[9px] tracking-[0.2em] uppercase text-white/25 font-normal font-body">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/4 last:border-0 hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-3 text-white/70 font-body font-medium">{u.full_name ?? "—"}</td>
                    <td className="px-5 py-3 text-white/40 font-body">{u.email ?? "—"}</td>
                    <td className="px-5 py-3 text-white/50 font-body">{u.order_count}</td>
                    <td className="px-5 py-3 text-[#C9A84C] font-semibold font-body">{fmt(u.lifetime_value)}</td>
                    <td className="px-5 py-3 text-white/30 text-xs font-body">{new Date(u.created_at).toLocaleDateString("en-NG")}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => deleteUser(u.id, u.full_name ?? "this user")}
                        className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-white/25 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
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
