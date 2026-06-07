import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import AdminAssistant from "@/components/admin/AdminAssistant";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/admin/login");

  const [productsRes, ordersRes] = await Promise.all([
    supabase.from("products").select("stock_count"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending_confirmation"),
  ]);
  const lowStock    = (productsRes.data ?? []).filter(p => (p.stock_count ?? 0) < 5).length;
  const pendingOrders = ordersRes.count ?? 0;

  return (
    <div className="admin-theme min-h-screen bg-[#0f0d0b]">
      <Sidebar
        name={profile.full_name ?? user.email?.split("@")[0] ?? "Admin"}
        email={user.email ?? ""}
        lowStock={lowStock}
        pendingOrders={pendingOrders}
      />
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full pb-24">
          {children}
        </div>
      </main>
      <AdminAssistant />
    </div>
  );
}
