"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Menu, X, ChevronDown, ArrowRight, Store, User, Package, Heart, Settings, LogOut, Sparkles } from "lucide-react";
import { useCart } from "@/store/cart";
import { useSiteAssistant } from "@/store/siteAssistant";

const shopCategories = [
  { label: "New In",      sub: ["This Week", "Last Drop", "Back in Stock"] },
  { label: "Clothing",    sub: ["Dresses", "Blazers", "Blouses", "Trousers", "Knitwear"] },
  { label: "Accessories", sub: ["Jewellery", "Bags", "Hats", "Scarves"] },
];

const browseCategories = [
  { label: "Dresses",     color: "bg-rose-100" },
  { label: "Blazers",     color: "bg-blue-100" },
  { label: "Knitwear",    color: "bg-amber-100" },
  { label: "Trousers",    color: "bg-emerald-100" },
  { label: "Footwear",    color: "bg-purple-100" },
  { label: "Accessories", color: "bg-pink-100" },
  { label: "New In",      color: "bg-sky-100" },
  { label: "Blouses",     color: "bg-orange-100" },
];

const mockUser = null as null | { name: string; email: string; initials: string };

export default function Header() {
  const [scrolled,     setScrolled]     = useState(false);
  const [shopOpen,     setShopOpen]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [query,        setQuery]        = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const { setOpen: openCart, count } = useCart();
  const { setOpen: setNovaOpen } = useSiteAssistant();
  const cartCount = count();

  const isSignedIn = !!mockUser;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (menuOpen || searchOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, searchOpen]);

  // close profile popover on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const pill    = scrolled ? "bg-background/90 border-border shadow-sm" : "bg-white/10 border-white/20";
  const linkCls = scrolled ? "text-foreground hover:text-accent" : "text-white hover:text-white/70";
  const iconCls = scrolled ? "text-foreground hover:text-accent" : "text-white hover:text-white/70";

  return (
    <>
      {/* ═══════════════ DESKTOP HEADER ═══════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 hidden lg:flex items-center px-6 transition-all duration-500">
        <div className="mx-auto w-full max-w-7xl flex items-center justify-between gap-4">

          {/* Left pill */}
          <nav className={`flex items-center gap-1 px-3 py-2 rounded-full border backdrop-blur-md transition-all duration-500 ${pill}`} onMouseLeave={() => setShopOpen(false)}>
            <div className="relative" onMouseEnter={() => setShopOpen(true)}>
              <button className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 ${linkCls}`}>
                Shop <ChevronDown size={10} className={`transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-[460px] bg-background border border-border shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${shopOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
                <div className="h-px w-full bg-primary" />
                <div className="grid grid-cols-3 p-8">
                  {shopCategories.map((cat) => (
                    <div key={cat.label} className="flex flex-col gap-3">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-primary">{cat.label}</span>
                      {cat.sub.map((s) => <Link key={s} href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{s}</Link>)}
                    </div>
                  ))}
                </div>
                <div className="border-t border-border px-8 py-4 flex items-center justify-between">
                  <span className="font-display text-sm text-muted-foreground italic">SS 2026 New Collection</span>
                  <Link href="/" className="text-[10px] uppercase tracking-[0.16em] text-primary hover:text-accent transition-colors">View all</Link>
                </div>
              </div>
            </div>
            {["New Collection", "Journal"].map((item) => (
              <Link key={item} href="/" className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 ${linkCls}`}>{item}</Link>
            ))}
          </nav>

          {/* Wordmark */}
          <Link href="/" className={`font-display text-2xl tracking-[0.22em] absolute left-1/2 -translate-x-1/2 transition-colors duration-300 ${scrolled ? "text-foreground" : "text-white"}`}>
            CLASSIQ
          </Link>

          {/* Right pill */}
          <div className={`flex items-center gap-1 px-3 py-2 rounded-full border backdrop-blur-md transition-all duration-500 ${pill}`}>
            {["About", "Contact"].map((item) => (
              <Link key={item} href="/" className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 ${linkCls}`}>{item}</Link>
            ))}
            <div className="w-px h-4 bg-current opacity-20 mx-1" />
            <button className={`p-2 rounded-full transition-colors duration-200 ${iconCls}`}>
              <Search size={15} strokeWidth={1.4} />
            </button>

            {/* Profile icon — desktop */}
            <div className="relative" ref={profileRef}>
              {isSignedIn ? (
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-[11px] font-medium flex items-center justify-center hover:bg-accent transition-colors duration-200 ml-1"
                >
                  {mockUser.initials}
                </button>
              ) : (
                <Link href="/auth" className={`p-2 rounded-full transition-colors duration-200 ${iconCls}`}>
                  <User size={15} strokeWidth={1.4} />
                </Link>
              )}

              {/* Desktop profile popover */}
              {isSignedIn && (
                <div className={`absolute top-[calc(100%+14px)] right-0 w-64 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${profileOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
                  <div className="h-px w-full bg-primary" />
                  {/* User info */}
                  <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center shrink-0">
                      {mockUser.initials}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{mockUser.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{mockUser.email}</p>
                    </div>
                  </div>
                  {/* Links */}
                  {[
                    { icon: User,    label: "My Profile",  href: "/profile" },
                    { icon: Package, label: "My Orders",   href: "/profile" },
                    { icon: Heart,   label: "Wishlist",    href: "/profile" },
                    { icon: Settings,label: "Settings",    href: "/profile" },
                  ].map(({ icon: Icon, label, href }) => (
                    <Link key={label} href={href} onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors border-b border-border/40 last:border-0">
                      <Icon size={14} strokeWidth={1.5} className="text-muted-foreground" />
                      {label}
                    </Link>
                  ))}
                  <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-rose-500 hover:bg-rose-50 transition-colors">
                    <LogOut size={14} strokeWidth={1.5} />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => openCart(true)} className={`relative p-2 rounded-full transition-colors duration-200 ${iconCls}`}>
              <ShoppingBag size={15} strokeWidth={1.4} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-primary-foreground text-[9px] flex items-center justify-center font-medium">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════ MOBILE TOP BAR ═══════════════ */}
      <div className={`fixed top-0 left-0 right-0 z-50 lg:hidden h-14 flex items-center justify-between px-5 transition-all duration-500 ${scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"}`}>
        <Link href="/" className={`font-display text-xl tracking-[0.22em] transition-colors duration-300 ${scrolled ? "text-foreground" : "text-white"}`}>
          CLASSIQ
        </Link>
        <button onClick={() => setMenuOpen(true)} className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 ${scrolled ? "border-border text-foreground" : "border-white/30 text-white"}`}>
          <Menu size={17} strokeWidth={1.5} />
        </button>
      </div>

      {/* ═══════════════ MOBILE BOTTOM PILL BAR ═══════════════ */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden">
        <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-primary backdrop-blur-xl border border-primary-foreground/10 shadow-2xl">

          {/* Shop */}
          <Link href="/" className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200">
            <Store size={18} strokeWidth={1.4} />
            <span className="text-[8px] uppercase tracking-[0.12em]">Shop</span>
          </Link>

          {/* Search */}
          <button onClick={() => setSearchOpen(true)} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200">
            <Search size={18} strokeWidth={1.4} />
            <span className="text-[8px] uppercase tracking-[0.12em]">Search</span>
          </button>

          {/* Nova AI */}
          <button onClick={() => setNovaOpen(v => !v)} className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200">
            <Sparkles size={18} strokeWidth={1.4} />
            <span className="text-[8px] uppercase tracking-[0.12em]">Nova</span>
          </button>

          {/* Profile */}
          {isSignedIn ? (
            <Link href="/profile" className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200">
              <div className="w-[18px] h-[18px] rounded-full bg-white text-primary text-[9px] font-semibold flex items-center justify-center leading-none">
                {mockUser.initials.charAt(0)}
              </div>
              <span className="text-[8px] uppercase tracking-[0.12em]">Profile</span>
            </Link>
          ) : (
            <Link href="/auth" className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200">
              <User size={18} strokeWidth={1.4} />
              <span className="text-[8px] uppercase tracking-[0.12em]">Sign in</span>
            </Link>
          )}

          {/* Cart */}
          <button onClick={() => openCart(true)} className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200">
            <ShoppingBag size={18} strokeWidth={1.4} />
            <span className="text-[8px] uppercase tracking-[0.12em]">Cart</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-white text-primary text-[8px] flex items-center justify-center font-medium">{cartCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* ═══════════════ MOBILE HAMBURGER MENU ═══════════════ */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-all duration-500 ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity duration-500 ${menuOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMenuOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-[82vw] max-w-xs bg-background flex flex-col transition-transform duration-500 ease-out ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between px-6 pt-12 pb-6 border-b border-border">
            <span className="font-display text-xl tracking-[0.18em]">CLASSIQ</span>
            <button onClick={() => setMenuOpen(false)} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors duration-200">
              <X size={16} strokeWidth={1.6} />
            </button>
          </div>
          <nav className="flex flex-col px-6 py-4 flex-1 overflow-y-auto">
            {["Shop", "New Collection", "Journal", "About", "Contact"].map((item) => (
              <Link key={item} href="/" onClick={() => setMenuOpen(false)} className="group flex items-center justify-between py-4 border-b border-border/40">
                <span className="font-display text-[2rem] leading-none text-foreground group-hover:text-primary transition-colors duration-200">{item}</span>
                <ArrowRight size={14} strokeWidth={1.4} className="text-border group-hover:text-primary transition-colors duration-200" />
              </Link>
            ))}
            <div className="mt-8 flex flex-col gap-3">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Browse</p>
              <div className="flex flex-wrap gap-2">
                {shopCategories.flatMap((c) => c.sub).map((s) => (
                  <Link key={s} href="/" onClick={() => setMenuOpen(false)} className="px-3.5 py-1.5 rounded-full border border-border text-[10px] uppercase tracking-[0.12em] text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200">{s}</Link>
                ))}
              </div>
            </div>
          </nav>
          {/* Bottom of drawer */}
          <div className="px-6 pb-10 pt-4 border-t border-border">
            {isSignedIn ? (
              <button className="w-full py-3.5 rounded-full border border-rose-200 text-rose-500 text-[11px] uppercase tracking-[0.18em] hover:bg-rose-50 transition-colors duration-200 flex items-center justify-center gap-2">
                <LogOut size={14} strokeWidth={1.5} />
                Sign out
              </button>
            ) : (
              <Link href="/auth" onClick={() => setMenuOpen(false)} className="w-full py-3.5 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] text-center hover:bg-accent transition-colors duration-200 block">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════ SPOTIFY-STYLE SEARCH OVERLAY ═══════════════ */}
      <div className={`fixed inset-0 z-[70] lg:hidden bg-background transition-all duration-300 ${searchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="flex items-center gap-3 px-5 pt-14 pb-4">
          <div className="flex-1 flex items-center gap-3 bg-muted rounded-full px-4 py-3">
            <Search size={16} strokeWidth={1.4} className="text-muted-foreground shrink-0" />
            <input autoFocus={searchOpen} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="What are you looking for?" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            {query && <button onClick={() => setQuery("")} className="text-muted-foreground"><X size={14} strokeWidth={1.6} /></button>}
          </div>
          <button onClick={() => { setSearchOpen(false); setQuery(""); }} className="text-[11px] uppercase tracking-[0.14em] text-foreground shrink-0">Cancel</button>
        </div>
        {!query && (
          <div className="px-5 overflow-y-auto pb-32">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-4">Browse categories</p>
            <div className="grid grid-cols-2 gap-3">
              {browseCategories.map(({ label, color }) => (
                <Link key={label} href="/" onClick={() => setSearchOpen(false)} className={`${color} rounded-2xl px-5 py-8 flex items-end`}>
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        {query && (
          <div className="px-5 overflow-y-auto pb-32">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-4">Results for &quot;{query}&quot;</p>
            {["Silk Wrap Dress", "Strappy Heeled Mules", "Knit Cardigan", "Tailored Blazer"].map((item) => (
              <Link key={item} href="/" onClick={() => setSearchOpen(false)} className="flex items-center gap-4 py-3.5 border-b border-border">
                <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm text-foreground">{item}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">women clothing</p>
                </div>
                <ArrowRight size={14} strokeWidth={1.4} className="text-border ml-auto" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
