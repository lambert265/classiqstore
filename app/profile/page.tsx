"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package, Heart, Settings, MapPin, LogOut,
  ChevronRight, ArrowLeft, Check, Edit2,
  Bell, Shield, CreditCard, Trash2, User,
  Lock, Smartphone, Eye, EyeOff, Camera,
  Star, Gift, Ruler,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Order = { id: string; date: string; status: string; items: number; total: number };
type WishlistItem = { id: number; name: string; price: string; img: string };
type Address = { id: number; label: string; address: string; city: string; zip: string; isDefault: boolean };

const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const placeholderWishlist: WishlistItem[] = [
  { id: 1, name: "Silk Wrap Dress",   price: "₦61,500", img: "/product-2.jpg" },
  { id: 2, name: "Ankle Strap Heels", price: "₦58,500", img: "/product-4.jpg" },
  { id: 3, name: "Tailored Blazer",   price: "₦78,000", img: "/product-1.jpg" },
];
const placeholderAddresses: Address[] = [
  { id: 1, label: "Home",   address: "14 Adeola Odeku Street", city: "Victoria Island, Lagos", zip: "101241", isDefault: true },
  { id: 2, label: "Office", address: "7 Sanusi Fafunwa Street", city: "Victoria Island, Lagos", zip: "101241", isDefault: false },
];

const statusColor: Record<string, string> = {
  Delivered:            "bg-emerald-100 text-emerald-700",
  "In Transit":         "bg-amber-100 text-amber-700",
  Shipped:              "bg-amber-100 text-amber-700",
  Processing:           "bg-blue-100 text-blue-700",
  Confirmed:            "bg-blue-100 text-blue-700",
  "Pending Confirmation": "bg-muted text-muted-foreground",
  Cancelled:            "bg-rose-100 text-rose-700",
};

const tabs = [
  { id: "orders",   label: "Orders",   icon: Package  },
  { id: "wishlist", label: "Wishlist", icon: Heart    },
  { id: "address",  label: "Address",  icon: MapPin   },
  { id: "settings", label: "Settings", icon: Settings },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${value ? "bg-primary" : "bg-border"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 flex items-center justify-center ${value ? "translate-x-5" : ""}`}>
        {value && <Check size={10} strokeWidth={2.5} className="text-primary" />}
      </span>
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<{ name: string; email: string; initials: string; joined: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const wishlist  = placeholderWishlist;
  const addresses = placeholderAddresses;

  const [activeTab,    setActiveTab]    = useState("orders");
  const [settingsTab,  setSettingsTab]  = useState("account");
  const [showPassword, setShowPassword] = useState(false);

  const [notifOrders,    setNotifOrders]    = useState(true);
  const [notifDrops,     setNotifDrops]     = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);
  const [notifSMS,       setNotifSMS]       = useState(false);
  const [notifEmail,     setNotifEmail]     = useState(true);

  const [sizePreference, setSizePreference] = useState("M");
  const [currency,       setCurrency]       = useState("NGN");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth"); return; }
      const fullName: string = data.user.user_metadata?.full_name ?? data.user.email ?? "User";
      const parts = fullName.trim().split(" ");
      const initials = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : fullName.slice(0, 2).toUpperCase();
      const joined = new Date(data.user.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      setAuthUser({ name: fullName, email: data.user.email ?? "", initials, joined });

      supabase
        .from("orders")
        .select("id, status, total_amount, items, created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .then(({ data: rows }) => {
          if (!rows) return;
          setOrders(rows.map((o) => ({
            id: `#CQ-${o.id.slice(0, 5).toUpperCase()}`,
            date: new Date(o.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            status: o.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            items: Array.isArray(o.items) ? o.items.length : 0,
            total: o.total_amount,
          })));
        });
    });
  }, [router]);

  async function handleSignOut() {
    await createClient().auth.signOut();
    router.push("/");
  }

  const totalSpend = orders.reduce((s, o) => s + o.total, 0);

  const settingsTabs = [
    { id: "account",       label: "Account",       icon: User      },
    { id: "notifications", label: "Notifications", icon: Bell      },
    { id: "security",      label: "Security",      icon: Shield    },
    { id: "payment",       label: "Payment",       icon: CreditCard },
    { id: "preferences",   label: "Preferences",   icon: Star      },
  ];

  const inputCls = "w-full bg-secondary border border-border text-foreground text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground";

  if (!authUser) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">

      {/* Top nav */}
      <div className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} strokeWidth={1.5} />
          </Link>
          <span className="font-display text-xl tracking-[0.14em]">My Account</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-32 md:pb-12">

        {/* Profile hero */}
        <div className="bg-white border border-blue-100 rounded-3xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center text-white font-display text-2xl tracking-wide">
                {authUser.initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary border-2 border-white flex items-center justify-center">
                <Camera size={12} className="text-white" />
              </button>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <h1 className="font-display text-2xl md:text-3xl text-foreground leading-none">{authUser.name}</h1>
              <p className="text-sm text-muted-foreground truncate">{authUser.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[9px] uppercase tracking-[0.16em] font-medium flex items-center gap-1">
                  <Gift size={9} /> Member
                </span>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Since {authUser.joined}</p>
              </div>
            </div>
            <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors shrink-0">
              <Edit2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Orders",   value: String(orders.length) },
            { label: "Wishlist", value: String(wishlist.length) },
            { label: "Spent",    value: fmt(totalSpend) },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-blue-100 rounded-2xl px-4 py-5 flex flex-col items-center gap-1">
              <span className="font-display text-2xl text-primary">{s.value}</span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tab pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.14em] whitespace-nowrap border transition-all duration-200 shrink-0 ${
                activeTab === id
                  ? "bg-primary text-white border-primary"
                  : "bg-background border-border text-muted-foreground hover:border-primary hover:text-foreground"
              }`}>
              <Icon size={13} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>

        {/* ── ORDERS ── */}
        {activeTab === "orders" && (
          <div className="flex flex-col gap-3">
            {orders.length === 0 ? (
              <div className="bg-white border border-blue-100 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
                <Package size={32} strokeWidth={1.2} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
                <Link href="/shop" className="px-6 py-2.5 rounded-full bg-primary text-white text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors">
                  Start shopping
                </Link>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="bg-white border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Package size={16} strokeWidth={1.5} className="text-primary" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{o.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-[0.12em] font-medium ${statusColor[o.status] ?? "bg-muted text-muted-foreground"}`}>{o.status}</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{o.date} · {o.items} item{o.items !== 1 ? "s" : ""}</p>
                    <p className="font-display text-base text-foreground">{fmt(o.total)}</p>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.4} className="text-border shrink-0" />
                </div>
              ))
            )}
          </div>
        )}

        {/* ── WISHLIST ── */}
        {activeTab === "wishlist" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {wishlist.map((w) => (
              <div key={w.id} className="bg-white border border-blue-100 rounded-2xl overflow-hidden flex flex-col group">
                <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                  <Image src={w.img} alt={w.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" sizes="33vw" />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors">
                    <Heart size={14} className="fill-rose-500" strokeWidth={1.4} />
                  </button>
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <p className="text-xs text-foreground leading-snug">{w.name}</p>
                  <p className="font-display text-sm text-foreground">{w.price}</p>
                  <button className="mt-1 w-full py-2 rounded-full bg-primary text-white text-[9px] uppercase tracking-[0.14em] hover:bg-accent transition-colors duration-200">
                    Add to bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ADDRESS ── */}
        {activeTab === "address" && (
          <div className="flex flex-col gap-3">
            {addresses.map((a) => (
              <div key={a.id} className="bg-white border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin size={16} strokeWidth={1.5} className="text-primary" />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{a.label}</p>
                    {a.isDefault && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] uppercase tracking-[0.12em]">Default</span>}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a.address}<br />{a.city}<br />Nigeria · {a.zip}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Edit2 size={13} strokeWidth={1.5} />
                  </button>
                  <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-rose-400 hover:text-rose-500 transition-colors">
                    <Trash2 size={13} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
            <button className="w-full py-4 rounded-2xl border-2 border-dashed border-border text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-200 flex items-center justify-center gap-2">
              <MapPin size={14} strokeWidth={1.5} /> Add new address
            </button>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === "settings" && (
          <div className="flex flex-col gap-4">

            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {settingsTabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setSettingsTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.14em] whitespace-nowrap border transition-all shrink-0 ${
                    settingsTab === id
                      ? "bg-primary text-white border-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary"
                  }`}>
                  <Icon size={11} strokeWidth={1.5} /> {label}
                </button>
              ))}
            </div>

            {settingsTab === "account" && (
              <div className="flex flex-col gap-4">
                <div className="bg-white border border-blue-100 rounded-2xl p-6 flex flex-col gap-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Personal Info</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Full Name</label>
                      <input type="text" defaultValue={authUser.name} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Email</label>
                      <input type="email" defaultValue={authUser.email} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Phone</label>
                      <input type="tel" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Date of Birth</label>
                      <input type="date" className={inputCls} />
                    </div>
                  </div>
                  <button className="self-start px-6 py-2.5 rounded-full bg-primary text-white text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {settingsTab === "notifications" && (
              <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden">
                {[
                  { label: "Order updates",    sub: "Shipping and delivery status alerts", value: notifOrders,    set: setNotifOrders },
                  { label: "New arrivals",      sub: "Be first to know about new drops",    value: notifDrops,     set: setNotifDrops },
                  { label: "Marketing emails",  sub: "Deals, offers, and style edits",      value: notifMarketing, set: setNotifMarketing },
                  { label: "SMS notifications", sub: "Text alerts for orders and delivery", value: notifSMS,       set: setNotifSMS },
                  { label: "Email digest",      sub: "Weekly summary of activity",          value: notifEmail,     set: setNotifEmail },
                ].map(({ label, sub, value, set: setVal }, i, arr) => (
                  <div key={label} className={`flex items-center gap-4 px-6 py-4 ${i < arr.length - 1 ? "border-b border-border/50" : ""}`}>
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span className="text-sm text-foreground">{label}</span>
                      <span className="text-[10px] text-muted-foreground">{sub}</span>
                    </div>
                    <Toggle value={value} onChange={setVal} />
                  </div>
                ))}
              </div>
            )}

            {settingsTab === "security" && (
              <div className="flex flex-col gap-4">
                <div className="bg-white border border-blue-100 rounded-2xl p-6 flex flex-col gap-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Change Password</p>
                  {["Current password", "New password", "Confirm new password"].map((label) => (
                    <div key={label} className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} className={`${inputCls} pr-10`} placeholder="••••••••" />
                        <button onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="self-start px-6 py-2.5 rounded-full bg-primary text-white text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors">
                    Update Password
                  </button>
                </div>
                <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden">
                  {[
                    { icon: Smartphone, label: "Two-factor authentication", sub: "Add an extra layer of security", action: "Enable" },
                    { icon: Lock,       label: "Active sessions",            sub: "Manage devices signed in",      action: "View" },
                  ].map(({ icon: Icon, label, sub, action }) => (
                    <div key={label} className="flex items-center gap-4 px-6 py-4 border-b border-border/50 last:border-0">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <Icon size={15} strokeWidth={1.5} className="text-primary" />
                      </div>
                      <div className="flex flex-col gap-0.5 flex-1">
                        <span className="text-sm text-foreground">{label}</span>
                        <span className="text-[10px] text-muted-foreground">{sub}</span>
                      </div>
                      <button className="text-[10px] uppercase tracking-[0.14em] text-primary hover:text-accent transition-colors">{action}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {settingsTab === "payment" && (
              <div className="flex flex-col gap-3">
                <div className="bg-white border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">VISA</span>
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <p className="text-sm text-foreground">Visa ending in 4242</p>
                    <p className="text-[10px] text-muted-foreground">Expires 08/28</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] uppercase tracking-[0.12em]">Default</span>
                  <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-rose-400 hover:text-rose-500 transition-colors">
                    <Trash2 size={13} strokeWidth={1.5} />
                  </button>
                </div>
                <button className="w-full py-4 rounded-2xl border-2 border-dashed border-border text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                  <CreditCard size={14} strokeWidth={1.5} /> Add payment method
                </button>
              </div>
            )}

            {settingsTab === "preferences" && (
              <div className="bg-white border border-blue-100 rounded-2xl p-6 flex flex-col gap-5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Shopping Preferences</p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5"><Ruler size={11} /> Default Size</label>
                  <div className="flex gap-2 flex-wrap">
                    {["XS","S","M","L","XL","2XL","3XL"].map((s) => (
                      <button key={s} onClick={() => setSizePreference(s)}
                        className={`px-4 py-2 rounded-full border text-xs uppercase tracking-[0.12em] transition-all ${
                          sizePreference === s ? "bg-primary text-white border-primary" : "border-border text-foreground hover:border-primary"
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Currency Display</label>
                  <div className="flex gap-2">
                    {["NGN","USD","GBP"].map((c) => (
                      <button key={c} onClick={() => setCurrency(c)}
                        className={`px-4 py-2 rounded-full border text-xs uppercase tracking-[0.12em] transition-all ${
                          currency === c ? "bg-primary text-white border-primary" : "border-border text-foreground hover:border-primary"
                        }`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="self-start px-6 py-2.5 rounded-full bg-primary text-white text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors">
                  Save Preferences
                </button>
              </div>
            )}

            {/* Sign out */}
            <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden mt-2">
              <button onClick={handleSignOut} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-rose-50 transition-colors group">
                <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                  <LogOut size={15} strokeWidth={1.5} className="text-rose-500" />
                </div>
                <span className="text-sm text-rose-500 flex-1 text-left">Sign out</span>
                <ChevronRight size={15} strokeWidth={1.4} className="text-rose-300" />
              </button>
              <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-rose-50 transition-colors border-t border-border/50">
                <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                  <Trash2 size={15} strokeWidth={1.5} className="text-rose-500" />
                </div>
                <div className="flex flex-col gap-0.5 flex-1 text-left">
                  <span className="text-sm text-rose-500">Delete account</span>
                  <span className="text-[10px] text-muted-foreground">This action is permanent and cannot be undone</span>
                </div>
                <ChevronRight size={15} strokeWidth={1.4} className="text-rose-300" />
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
