"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  Scissors, BookOpen, Mail, LogOut, ExternalLink,
  Menu, X, BarChart2, Settings, Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard",       href: "/dashboard",       icon: LayoutDashboard },
  { label: "Analytics",       href: "/analytics",       icon: BarChart2 },
  { label: "Orders",          href: "/orders",          icon: ShoppingBag },
  { label: "Products",        href: "/products",        icon: Package },
  { label: "Users",           href: "/users",           icon: Users },
  { label: "Custom Requests", href: "/custom-requests", icon: Scissors },
  { label: "Discounts",       href: "/discounts",       icon: Tag },
  { label: "Lookbook",        href: "/lookbook",        icon: BookOpen },
  { label: "Subscribers",     href: "/subscribers",     icon: Mail },
  { label: "Settings",        href: "/settings",        icon: Settings },
];

function NavContent({ name, email, pathname, lowStock, pendingOrders, onNav, onSignOut }: {
  name: string; email: string; pathname: string; lowStock: number; pendingOrders: number;
  onNav: () => void; onSignOut: () => void;
}) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-white/6 shrink-0">
        <h1 className="font-heading text-xl font-bold text-white tracking-tight">CLASSIQ</h1>
        <p className="text-[10px] text-[#6b9e7e] tracking-[0.2em] uppercase mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-0.5">
        <p className="text-[9px] tracking-[0.25em] uppercase text-white/20 px-3 mb-3">Navigation</p>
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const badge = href === "/products" && lowStock > 0 ? lowStock
            : href === "/orders" && pendingOrders > 0 ? pendingOrders
            : null;
          return (
            <Link key={href} href={href} onClick={onNav}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm card-hover",
                active
                  ? "bg-[#1B4332] text-[#4ade80] border border-[#2D6A4F]/50 shadow-lg shadow-black/20"
                  : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
              )}>
              <Icon size={15} strokeWidth={active ? 2 : 1.5} />
              <span className="font-body">{label}</span>
              {badge !== null && (
                <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-[#0d1f16] text-[9px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
              {active && badge === null && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4ade80]" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/6 space-y-1 shrink-0">
        <a href={process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "/"} target="_blank" rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/25 hover:text-white/50 transition-all">
          <ExternalLink size={13} />
          View Main Site
        </a>
        <div className="flex items-center gap-3 px-3 py-2.5 bg-[#1B4332]/40 rounded-xl border border-white/5">
          <div className="w-8 h-8 rounded-full bg-[#2D6A4F] border border-[#4ade80]/20 flex items-center justify-center text-xs font-bold text-[#4ade80] shrink-0 font-heading">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/80 truncate font-medium font-body">{name}</p>
            <p className="text-[10px] text-white/30 truncate font-body">{email}</p>
          </div>
        </div>
        <button onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-400/50 hover:text-red-400 btn-3d btn-3d-red font-body">
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ name, email, lowStock, pendingOrders }: { name: string; email: string; lowStock: number; pendingOrders: number }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const props = { name, email, pathname, lowStock, pendingOrders, onNav: () => setOpen(false), onSignOut: signOut };

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-[#0a1a10] border-r border-white/6 flex-col fixed top-0 left-0 h-full z-30">
        <NavContent {...props} />
      </aside>

      <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-[#0a1a10] border-b border-white/6 flex items-center justify-between px-4 z-40">
        <h1 className="font-heading text-lg font-bold text-white">CLASSIQ</h1>
        <button onClick={() => setOpen(v => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/6 border border-white/8 btn-3d">
          {open ? <X size={16} className="text-white/70" /> : <Menu size={16} className="text-white/70" />}
        </button>
      </header>

      {open && <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />}

      <aside className={cn(
        "lg:hidden fixed top-0 left-0 h-full w-72 bg-[#0a1a10] border-r border-white/6 z-50 transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <button onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/6 hover:bg-white/10 transition-all">
          <X size={14} className="text-white/50" />
        </button>
        <NavContent {...props} />
      </aside>
    </>
  );
}
