import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminAssistant from "@/components/admin/AdminAssistant";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
}

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
  const lowStock = (productsRes.data ?? []).filter(p => (p.stock_count ?? 0) < 5).length;
  const pendingOrders = ordersRes.count ?? 0;

  return (
    <div className="admin-theme min-h-screen" style={{
        background: "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(201,168,76,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(196,98,45,0.10) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 50% 50%, rgba(45,106,79,0.06) 0%, transparent 70%), #0f0d0b"
      }}>
      <AdminSidebar
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
