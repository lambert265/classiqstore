"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package, Heart, Settings, MapPin, LogOut,
  ChevronRight, ArrowLeft, Check, Edit2,
  Bell, Shield, CreditCard, Trash2, User,
  Lock, Smartphone, Eye, EyeOff, Camera,
  Star, Gift, Ruler, Scissors, TrendingUp,
  Clock, CheckCircle, XCircle, RefreshCw, AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Order = { id: string; rawId: string; date: string; status: string; items: number; total: number };
type CustomRequest = { id: string; type: string; status: string; date: string; quote: number | null };
type Profile = {
  id: string; full_name: string | null; email: string | null;
  phone: string | null; date_of_birth: string | null;
  size_preference: string | null; currency: string | null;
  notif_orders: boolean; notif_drops: boolean;
  notif_marketing: boolean; notif_sms: boolean; notif_email: boolean;
};

const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const statusColor: Record<string, string> = {
  Delivered:              "bg-emerald-100 text-emerald-700",
  "In Transit":           "bg-amber-100 text-amber-700",
  Shipped:                "bg-amber-100 text-amber-700",
  Processing:             "bg-blue-100 text-blue-700",
  Confirmed:              "bg-blue-100 text-blue-700",
  "Pending Confirmation": "bg-slate-100 text-slate-500",
  Cancelled:              "bg-rose-100 text-rose-700",
  Pending:                "bg-slate-100 text-slate-500",
  "In Progress":          "bg-blue-100 text-blue-700",
  Quoted:                 "bg-violet-100 text-violet-700",
  Accepted:               "bg-emerald-100 text-emerald-700",
  Completed:              "bg-emerald-100 text-emerald-700",
};

const statusIcon: Record<string, React.ReactNode> = {
  Delivered:  <CheckCircle size={13} className="text-emerald-600" />,
  Shipped:    <TrendingUp size={13} className="text-amber-600" />,
  Processing: <RefreshCw size={13} className="text-blue-600" />,
  Cancelled:  <XCircle size={13} className="text-rose-600" />,
};

const tabs = [
  { id: "orders",   label: "Orders",   icon: Package  },
  { id: "requests", label: "Custom",   icon: Scissors },
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

function EmptyState({ icon: Icon, text, cta, href }: { icon: React.ElementType; text: string; cta?: string; href?: string }) {
  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
      <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
        <Icon size={24} strokeWidth={1.2} className="text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
      {cta && href && (
        <Link href={href} className="px-6 py-2.5 rounded-full bg-primary text-white text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors">
          {cta}
        </Link>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [authUser, setAuthUser] = useState<{ id: string; name: string; email: string; initials: string; joined: string; avatar: string | null } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [totalSpend, setTotalSpend] = useState(0);

  const [activeTab,   setActiveTab]   = useState("orders");
  const [settingsTab, setSettingsTab] = useState("account");
  const [showPass,    setShowPass]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState<{ text: string; ok: boolean } | null>(null);

  // account fields
  const [fullName, setFullName] = useState("");
  const [phone,    setPhone]    = useState("");
  const [dob,      setDob]      = useState("");

  // password fields
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passMsg,     setPassMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const [savingPass,  setSavingPass]  = useState(false);

  // notifications
  const [notifOrders,    setNotifOrders]    = useState(true);
  const [notifDrops,     setNotifDrops]     = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);
  const [notifSMS,       setNotifSMS]       = useState(false);
  const [notifEmail,     setNotifEmail]     = useState(true);

  // preferences
  const [size,     setSize]     = useState("M");
  const [currency, setCurrency] = useState("NGN");

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (!data) return;
    setProfile(data);
    setFullName(data.full_name ?? "");
    setPhone(data.phone ?? "");
    setDob(data.date_of_birth ?? "");
    setSize(data.size_preference ?? "M");
    setCurrency(data.currency ?? "NGN");
    setNotifOrders(data.notif_orders ?? true);
    setNotifDrops(data.notif_drops ?? true);
    setNotifMarketing(data.notif_marketing ?? false);
    setNotifSMS(data.notif_sms ?? false);
    setNotifEmail(data.notif_email ?? true);
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth"); return; }
      const u = data.user;
      const name: string = u.user_metadata?.full_name ?? u.email ?? "User";
      const parts = name.trim().split(" ");
      const initials = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
      const joined = new Date(u.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      setAuthUser({ id: u.id, name, email: u.email ?? "", initials, joined, avatar: u.user_metadata?.avatar_url ?? null });

      loadProfile(u.id);

      supabase.from("orders")
        .select("id, status, total_amount, items, created_at")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false })
        .then(({ data: rows }) => {
          if (!rows) return;
          setTotalSpend(rows.reduce((s, o) => s + (o.total_amount ?? 0), 0));
          setOrders(rows.map((o) => ({
            rawId: o.id,
            id: `#CQ-${o.id.slice(0, 5).toUpperCase()}`,
            date: new Date(o.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            status: o.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            items: Array.isArray(o.items) ? o.items.length : 0,
            total: o.total_amount,
          })));
        });

      supabase.from("custom_requests")
        .select("id, product_type, status, quote_amount, created_at")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false })
        .then(({ data: rows }) => {
          if (!rows) return;
          setRequests(rows.map((r) => ({
            id: `#CR-${r.id.slice(0, 5).toUpperCase()}`,
            type: r.product_type ?? "Custom piece",
            status: r.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            date: new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            quote: r.quote_amount,
          })));
        });
    });
  }, [router, supabase, loadProfile]);

  async function handleSaveProfile() {
    if (!authUser) return;
    setSaving(true);
    setSaveMsg(null);
    const updates = { full_name: fullName, phone, date_of_birth: dob || null };
    const [authRes, dbRes] = await Promise.all([
      supabase.auth.updateUser({ data: { full_name: fullName } }),
      supabase.from("profiles").update(updates).eq("id", authUser.id),
    ]);
    setSaving(false);
    if (authRes.error || dbRes.error) {
      setSaveMsg({ text: "Failed to save. Try again.", ok: false });
    } else {
      setSaveMsg({ text: "Profile saved!", ok: true });
      setAuthUser((u) => u ? { ...u, name: fullName } : u);
    }
    setTimeout(() => setSaveMsg(null), 3000);
  }

  async function handleSaveNotifications() {
    if (!authUser) return;
    setSaving(true);
    await supabase.from("profiles").update({
      notif_orders: notifOrders,
      notif_drops: notifDrops,
      notif_marketing: notifMarketing,
      notif_sms: notifSMS,
      notif_email: notifEmail,
    }).eq("id", authUser.id);
    setSaving(false);
    setSaveMsg({ text: "Preferences saved!", ok: true });
    setTimeout(() => setSaveMsg(null), 3000);
  }

  async function handleSavePreferences() {
    if (!authUser) return;
    setSaving(true);
    await supabase.from("profiles").update({ size_preference: size, currency }).eq("id", authUser.id);
    setSaving(false);
    setSaveMsg({ text: "Preferences saved!", ok: true });
    setTimeout(() => setSaveMsg(null), 3000);
  }

  async function handleUpdatePassword() {
    if (newPass !== confirmPass) {
      setPassMsg({ text: "Passwords do not match.", ok: false });
      return;
    }
    if (newPass.length < 6) {
      setPassMsg({ text: "Password must be at least 6 characters.", ok: false });
      return;
    }
    setSavingPass(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setSavingPass(false);
    if (error) {
      setPassMsg({ text: error.message, ok: false });
    } else {
      setPassMsg({ text: "Password updated!", ok: true });
      setNewPass(""); setConfirmPass("");
    }
    setTimeout(() => setPassMsg(null), 3000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const settingsTabs = [
    { id: "account",       label: "Account",       icon: User       },
    { id: "notifications", label: "Notifications", icon: Bell       },
    { id: "security",      label: "Security",      icon: Shield     },
    { id: "preferences",   label: "Preferences",   icon: Star       },
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
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} strokeWidth={1.5} />
          </Link>
          <span className="font-display text-xl tracking-[0.14em]">My Account</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 pb-32 md:pb-12">

        {/* Profile hero */}
        <div className="bg-white border border-blue-100 rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-5">
            <div className="relative shrink-0">
              {authUser.avatar ? (
                <Image src={authUser.avatar} alt={authUser.name} width={88} height={88} className="rounded-full object-cover border-2 border-primary/20" />
              ) : (
                <div className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] rounded-full bg-primary flex items-center justify-center text-white font-display text-2xl tracking-wide">
                  {authUser.initials}
                </div>
              )}
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary border-2 border-white flex items-center justify-center shadow-sm">
                <Camera size={12} className="text-white" />
              </button>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <h1 className="font-display text-2xl md:text-3xl text-foreground leading-none">{authUser.name}</h1>
              <p className="text-sm text-muted-foreground truncate">{authUser.email}</p>
              {profile?.phone && <p className="text-xs text-muted-foreground">{profile.phone}</p>}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[9px] uppercase tracking-[0.16em] font-medium flex items-center gap-1">
                  <Gift size={9} /> Member
                </span>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Since {authUser.joined}</p>
              </div>
            </div>
            <button onClick={() => { setActiveTab("settings"); setSettingsTab("account"); }}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors shrink-0">
              <Edit2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Orders",   value: String(orders.length),   icon: Package    },
            { label: "Requests", value: String(requests.length), icon: Scissors   },
            { label: "Wishlist", value: "—",                     icon: Heart      },
            { label: "Spent",    value: totalSpend > 0 ? fmt(totalSpend) : "₦0",  icon: TrendingUp },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-blue-100 rounded-2xl px-3 py-4 flex flex-col items-center gap-1.5">
              <s.icon size={16} strokeWidth={1.4} className="text-primary" />
              <span className="font-display text-xl text-foreground">{s.value}</span>
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
              <Icon size={13} strokeWidth={1.5} />{label}
            </button>
          ))}
        </div>

        {/* ── ORDERS ── */}
        {activeTab === "orders" && (
          <div className="flex flex-col gap-3">
            {orders.length === 0 ? (
              <EmptyState icon={Package} text="No orders yet" cta="Start shopping" href="/shop" />
            ) : orders.map((o) => (
              <div key={o.rawId} className="bg-white border border-blue-100 rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {statusIcon[o.status] ?? <Package size={16} strokeWidth={1.5} className="text-primary" />}
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{o.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-[0.12em] font-medium ${statusColor[o.status] ?? "bg-muted text-muted-foreground"}`}>{o.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <Clock size={10} strokeWidth={1.5} />
                    {o.date} · {o.items} item{o.items !== 1 ? "s" : ""}
                  </div>
                  <p className="font-display text-base text-foreground">{fmt(o.total)}</p>
                </div>
                <ChevronRight size={16} strokeWidth={1.4} className="text-border shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* ── CUSTOM REQUESTS ── */}
        {activeTab === "requests" && (
          <div className="flex flex-col gap-3">
            {requests.length === 0 ? (
              <EmptyState icon={Scissors} text="No custom requests yet" cta="Make a request" href="/contact" />
            ) : requests.map((r) => (
              <div key={r.id} className="bg-white border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
                  <Scissors size={16} strokeWidth={1.5} className="text-violet-600" />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground capitalize">{r.type}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-[0.12em] font-medium ${statusColor[r.status] ?? "bg-muted text-muted-foreground"}`}>{r.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <Clock size={10} strokeWidth={1.5} />{r.date} · {r.id}
                  </div>
                  {r.quote && <p className="font-display text-base text-violet-700">Quote: {fmt(r.quote)}</p>}
                </div>
                <ChevronRight size={16} strokeWidth={1.4} className="text-border shrink-0" />
              </div>
            ))}
            <Link href="/contact"
              className="w-full py-4 rounded-2xl border-2 border-dashed border-border text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 mt-1">
              <Scissors size={13} strokeWidth={1.5} /> New custom request
            </Link>
          </div>
        )}

        {/* ── WISHLIST ── */}
        {activeTab === "wishlist" && (
          <EmptyState icon={Heart} text="Your wishlist is empty — save pieces you love" cta="Browse collection" href="/shop" />
        )}

        {/* ── ADDRESS ── */}
        {activeTab === "address" && (
          <div className="flex flex-col gap-3">
            <EmptyState icon={MapPin} text="No saved addresses yet" />
            <button className="w-full py-4 rounded-2xl border-2 border-dashed border-border text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
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
                    settingsTab === id ? "bg-primary text-white border-primary" : "bg-background border-border text-muted-foreground hover:border-primary"
                  }`}>
                  <Icon size={11} strokeWidth={1.5} /> {label}
                </button>
              ))}
            </div>

            {/* Save feedback */}
            {saveMsg && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${saveMsg.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
                {saveMsg.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {saveMsg.text}
              </div>
            )}

            {/* ── ACCOUNT ── */}
            {settingsTab === "account" && (
              <div className="bg-white border border-blue-100 rounded-2xl p-6 flex flex-col gap-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Personal Info</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Email</label>
                    <input type="email" defaultValue={authUser.email} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Phone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Date of Birth</label>
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <button onClick={handleSaveProfile} disabled={saving}
                  className="self-start px-6 py-2.5 rounded-full bg-primary text-white text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors disabled:opacity-60">
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {settingsTab === "notifications" && (
              <div className="flex flex-col gap-3">
                <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden">
                  {[
                    { label: "Order updates",    sub: "Shipping and delivery status alerts", value: notifOrders,    set: setNotifOrders    },
                    { label: "New arrivals",      sub: "Be first to know about new drops",    value: notifDrops,     set: setNotifDrops     },
                    { label: "Marketing emails",  sub: "Deals, offers, and style edits",      value: notifMarketing, set: setNotifMarketing },
                    { label: "SMS notifications", sub: "Text alerts for orders and delivery", value: notifSMS,       set: setNotifSMS       },
                    { label: "Email digest",      sub: "Weekly summary of activity",          value: notifEmail,     set: setNotifEmail     },
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
                <button onClick={handleSaveNotifications} disabled={saving}
                  className="self-start px-6 py-2.5 rounded-full bg-primary text-white text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors disabled:opacity-60">
                  {saving ? "Saving…" : "Save Notification Settings"}
                </button>
              </div>
            )}

            {/* ── SECURITY ── */}
            {settingsTab === "security" && (
              <div className="flex flex-col gap-4">
                <div className="bg-white border border-blue-100 rounded-2xl p-6 flex flex-col gap-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Change Password</p>
                  {passMsg && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${passMsg.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
                      {passMsg.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      {passMsg.text}
                    </div>
                  )}
                  {[
                    { label: "New password",         value: newPass,     set: setNewPass     },
                    { label: "Confirm new password",  value: confirmPass, set: setConfirmPass },
                  ].map(({ label, value, set: setVal }) => (
                    <div key={label} className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</label>
                      <div className="relative">
                        <input type={showPass ? "text" : "password"} value={value} onChange={(e) => setVal(e.target.value)}
                          className={`${inputCls} pr-10`} placeholder="••••••••" />
                        <button onClick={() => setShowPass(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPass ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={handleUpdatePassword} disabled={savingPass}
                    className="self-start px-6 py-2.5 rounded-full bg-primary text-white text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors disabled:opacity-60">
                    {savingPass ? "Updating…" : "Update Password"}
                  </button>
                </div>
                <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden">
                  {[
                    { icon: Smartphone, label: "Two-factor authentication", sub: "Add an extra layer of security", action: "Enable" },
                    { icon: Lock,       label: "Active sessions",            sub: "Manage devices signed in",      action: "View"   },
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

            {/* ── PREFERENCES ── */}
            {settingsTab === "preferences" && (
              <div className="bg-white border border-blue-100 rounded-2xl p-6 flex flex-col gap-6">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Shopping Preferences</p>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5">
                    <Ruler size={11} /> Default Size
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {["XS","S","M","L","XL","2XL","3XL"].map((s) => (
                      <button key={s} onClick={() => setSize(s)}
                        className={`px-4 py-2 rounded-full border text-xs uppercase tracking-[0.12em] transition-all ${
                          size === s ? "bg-primary text-white border-primary" : "border-border text-foreground hover:border-primary"
                        }`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Currency Display</label>
                  <div className="flex gap-2">
                    {["NGN","USD","GBP"].map((c) => (
                      <button key={c} onClick={() => setCurrency(c)}
                        className={`px-4 py-2 rounded-full border text-xs uppercase tracking-[0.12em] transition-all ${
                          currency === c ? "bg-primary text-white border-primary" : "border-border text-foreground hover:border-primary"
                        }`}>{c}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleSavePreferences} disabled={saving}
                  className="self-start px-6 py-2.5 rounded-full bg-primary text-white text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors disabled:opacity-60">
                  {saving ? "Saving…" : "Save Preferences"}
                </button>
              </div>
            )}

            {/* Sign out + Delete */}
            <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden mt-2">
              <button onClick={handleSignOut} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-rose-50 transition-colors">
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
