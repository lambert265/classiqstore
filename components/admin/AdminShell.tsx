"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, Palette, Users,
  Mail, BarChart2, BookImage, Settings, LogOut, Menu, X,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import AdminAssistant from "./AdminAssistant";

const NAV = [
  { href: "/admin/dashboard",       label: "Dashboard",        icon: LayoutDashboard },
  { href: "/admin/analytics",       label: "Analytics",        icon: BarChart2 },
  { href: "/admin/orders",          label: "Orders",           icon: ShoppingBag },
  { href: "/admin/products",        label: "Products",         icon: Package },
  { href: "/admin/users",           label: "Users",            icon: Users },
  { href: "/admin/custom-requests", label: "Custom Requests",  icon: Palette },
  { href: "/admin/lookbook",        label: "Lookbook",         icon: BookImage },
  { href: "/admin/subscribers",     label: "Subscribers",      icon: Mail },
  { href: "/admin/settings",        label: "Settings",         icon: Settings },
];

function NavContent({ pathname, onNav, onSignOut }: {
  pathname: string; onNav: () => void; onSignOut: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-white/6 shrink-0">
        <h1 className="font-heading text-xl font-bold text-white tracking-tight">CLASSIQ</h1>
        <p className="text-[10px] text-[#6b9e7e] tracking-[0.2em] uppercase mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-0.5">
        <p className="text-[9px] tracking-[0.25em] uppercase text-white/20 px-3 mb-3">Navigation</p>
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={onNav}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm card-hover ${
                active
                  ? "bg-[#1B4332] text-[#4ade80] border border-[#2D6A4F]/50 shadow-lg shadow-black/20"
                  : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
              }`}>
              <Icon size={15} strokeWidth={active ? 2 : 1.5} />
              <span className="font-body">{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4ade80]" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/6 space-y-1 shrink-0">
        <a href="/" target="_blank" rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/25 hover:text-white/50 transition-all">
          <ExternalLink size={13} />
          View Main Site
        </a>
        <div className="flex items-center gap-3 px-3 py-2.5 bg-[#1B4332]/40 rounded-xl border border-white/5">
          <div className="w-8 h-8 rounded-full bg-[#2D6A4F] border border-[#4ade80]/20 flex items-center justify-center text-xs font-bold text-[#4ade80] shrink-0 font-heading">
            Q
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/80 truncate font-medium font-body">Queen</p>
            <p className="text-[10px] text-white/30 truncate font-body">Admin</p>
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

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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

  const props = { pathname, onNav: () => setOpen(false), onSignOut: signOut };

  return (
    <div className="min-h-screen bg-[#0d1f16]">
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

      <aside className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-[#0a1a10] border-r border-white/6 z-50 transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}>
        <button onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/6 hover:bg-white/10 transition-all">
          <X size={14} className="text-white/50" />
        </button>
        <NavContent {...props} />
      </aside>

      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full pb-24">
          {children}
        </div>
      </main>

      <AdminAssistant />
    </div>
  );
}
