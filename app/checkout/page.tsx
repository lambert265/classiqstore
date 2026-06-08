"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Lock, ChevronRight, CheckCircle,
  CreditCard, Smartphone, Building2, Tag, ShoppingBag,
} from "lucide-react";
import { useCart } from "@/store/cart";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

const DELIVERY_FEE = 3500;
const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const paymentMethods = [
  { id: "card",        label: "Debit / Credit Card",  sub: "Visa, Mastercard, Verve",        icon: CreditCard },
  { id: "transfer",    label: "Bank Transfer",         sub: "Pay directly from your bank",    icon: Building2 },
  { id: "ussd",        label: "USSD",                  sub: "*737#, *919# and more",          icon: Smartphone },
];

type Step = "details" | "payment" | "confirm";

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [step,          setStep]          = useState<Step>("details");
  const [payMethod,     setPayMethod]     = useState("card");
  const [promoCode,     setPromoCode]     = useState("");
  const [promoApplied,  setPromoApplied]  = useState(false);
  const [processing,    setProcessing]    = useState(false);
  const [done,          setDone]          = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setIsSignedIn(!!data.user);
    });
  }, []);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", address: "", city: "", state: "", zip: "",
  });

  const cartItems = items;
  const subtotal  = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discount  = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total     = subtotal - discount + DELIVERY_FEE;

  const handleField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setDone(true); clear(); }, 2800);
  };

  /* ── Empty cart gate ── */
  if (items.length === 0 && !done) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-6 py-20">
        <div className="glass rounded-3xl p-10 w-full max-w-md flex flex-col items-center text-center gap-7">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingBag size={24} strokeWidth={1.4} className="text-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl text-foreground">Your bag is empty</h1>
            <p className="text-sm text-muted-foreground">Add some pieces before checking out.</p>
          </div>
          <Link href="/" className="w-full py-4 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] text-center hover:bg-accent transition-colors duration-300">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  /* ── Auth gate ── */
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-6 py-20">
        <div className="glass rounded-3xl p-10 w-full max-w-md flex flex-col items-center text-center gap-7">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock size={24} strokeWidth={1.4} className="text-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl text-foreground">Sign in to checkout</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You need an account to complete your purchase. It only takes a moment.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Link href="/auth" className="w-full py-4 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] text-center hover:bg-accent transition-colors duration-300">
              Sign in
            </Link>
            <Link href="/auth" className="w-full py-4 rounded-full border border-border text-foreground text-[11px] uppercase tracking-[0.18em] text-center hover:border-primary hover:text-primary transition-colors duration-200">
              Create account
            </Link>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={12} strokeWidth={1.5} />
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  /* ── Order confirmed ── */
  if (done) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-6 py-20">
        <div className="glass rounded-3xl p-10 w-full max-w-md flex flex-col items-center text-center gap-7">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={28} strokeWidth={1.4} className="text-emerald-600" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl text-foreground">Order confirmed!</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Thank you for your order. We&apos;ve sent a confirmation to{" "}
              <span className="text-foreground font-medium">{form.email || "your email"}</span>.
            </p>
          </div>
          <div className="w-full glass rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order number</span>
              <span className="font-medium text-foreground">#NV-00{Math.floor(Math.random() * 900 + 100)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total paid</span>
              <span className="font-medium text-foreground">{fmt(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated delivery</span>
              <span className="font-medium text-foreground">3–5 business days</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Link href="/profile" className="w-full py-4 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] text-center hover:bg-accent transition-colors duration-300">
              Track my order
            </Link>
            <Link href="/" className="w-full py-4 rounded-full border border-border text-foreground text-[11px] uppercase tracking-[0.18em] text-center hover:border-primary hover:text-primary transition-colors duration-200">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary pb-32 md:pb-16">

      {/* ── Top bar ── */}
      <div className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={13} strokeWidth={1.5} />
            Back
          </Link>
          <Link href="/" className="font-display text-xl tracking-[0.22em] text-foreground">CLASSIQ</Link>
          <div className="flex items-center gap-1.5">
            <Lock size={12} strokeWidth={1.5} className="text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Secure checkout</span>
          </div>
        </div>
      </div>

      {/* ── Step indicator ── */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2">
          {(["details", "payment", "confirm"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.14em] transition-all duration-200 ${
                step === s ? "bg-primary text-primary-foreground" :
                (["details","payment","confirm"].indexOf(step) > i) ? "bg-primary/20 text-primary" :
                "bg-background border border-border text-muted-foreground"
              }`}>
                <span>{i + 1}</span>
                <span className="hidden sm:inline">{s === "details" ? "Delivery" : s === "payment" ? "Payment" : "Review"}</span>
              </div>
              {i < 2 && <ChevronRight size={14} strokeWidth={1.4} className="text-border shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

        {/* ══════════ LEFT COLUMN ══════════ */}
        <div className="flex flex-col gap-6">

          {/* ── STEP 1: Delivery details ── */}
          {step === "details" && (
            <div className="glass rounded-3xl p-7 flex flex-col gap-6">
              <h2 className="font-display text-2xl text-foreground">Delivery details</h2>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "firstName", label: "First name",    col: 1 },
                  { key: "lastName",  label: "Last name",     col: 1 },
                  { key: "email",     label: "Email address", col: 2 },
                  { key: "phone",     label: "Phone number",  col: 2 },
                ].map(({ key, label, col }) => (
                  <div key={key} className={`flex flex-col gap-1.5 ${col === 2 ? "col-span-2" : ""}`}>
                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
                    <input
                      type={key === "email" ? "email" : "text"}
                      value={form[key as keyof typeof form]}
                      onChange={handleField(key as keyof typeof form)}
                      placeholder={label}
                      className="w-full border border-border rounded-full px-5 py-3.5 text-sm text-foreground bg-background placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="w-full h-px bg-border" />

              <div className="flex flex-col gap-4">
                <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Street address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={handleField("address")}
                  placeholder="House number and street name"
                  className="w-full border border-border rounded-full px-5 py-3.5 text-sm text-foreground bg-background placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                />
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: "city",  label: "City",     placeholder: "Lagos" },
                    { key: "state", label: "State",    placeholder: "Lagos State" },
                    { key: "zip",   label: "ZIP / Postcode", placeholder: "101241" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
                      <input
                        type="text"
                        value={form[key as keyof typeof form]}
                        onChange={handleField(key as keyof typeof form)}
                        placeholder={placeholder}
                        className="w-full border border-border rounded-full px-4 py-3.5 text-sm text-foreground bg-background placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep("payment")}
                className="w-full py-4 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-300 mt-2"
              >
                Continue to payment
              </button>
            </div>
          )}

          {/* ── STEP 2: Payment ── */}
          {step === "payment" && (
            <div className="flex flex-col gap-5">
              <div className="glass rounded-3xl p-7 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl text-foreground">Payment method</h2>
                  <div className="flex items-center gap-1.5">
                    <Lock size={12} strokeWidth={1.5} className="text-muted-foreground" />
                    <span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">256-bit SSL</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {paymentMethods.map(({ id, label, sub, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setPayMethod(id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                        payMethod === id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${payMethod === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <Icon size={17} strokeWidth={1.4} />
                      </div>
                      <div className="flex flex-col gap-0.5 flex-1">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <span className="text-[10px] text-muted-foreground">{sub}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${payMethod === id ? "border-primary" : "border-border"}`}>
                        {payMethod === id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Card fields — shown when card selected */}
                {payMethod === "card" && (
                  <div className="flex flex-col gap-4 pt-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Card number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" maxLength={19} className="w-full border border-border rounded-full px-5 py-3.5 text-sm text-foreground bg-background placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Expiry</label>
                        <input type="text" placeholder="MM / YY" maxLength={7} className="w-full border border-border rounded-full px-5 py-3.5 text-sm text-foreground bg-background placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">CVV</label>
                        <input type="text" placeholder="•••" maxLength={4} className="w-full border border-border rounded-full px-5 py-3.5 text-sm text-foreground bg-background placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Name on card</label>
                      <input type="text" placeholder="As it appears on your card" className="w-full border border-border rounded-full px-5 py-3.5 text-sm text-foreground bg-background placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                )}

                {/* Bank transfer instructions */}
                {payMethod === "transfer" && (
                  <div className="bg-muted rounded-2xl p-5 flex flex-col gap-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Transfer details</p>
                    <p className="text-sm text-foreground">You will receive bank account details after placing your order. Payment must be made within 24 hours.</p>
                  </div>
                )}

                {/* USSD instructions */}
                {payMethod === "ussd" && (
                  <div className="bg-muted rounded-2xl p-5 flex flex-col gap-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">USSD instructions</p>
                    <p className="text-sm text-foreground">Dial your bank&apos;s USSD code and follow the prompts. You will receive a reference code to complete payment.</p>
                  </div>
                )}

                {/* Powered by */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Powered by</span>
                  <span className="text-[11px] font-semibold text-foreground tracking-wide">Paystack</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-[11px] font-semibold text-foreground tracking-wide">Flutterwave</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("details")} className="px-6 py-4 rounded-full border border-border text-[11px] uppercase tracking-[0.18em] text-foreground hover:border-primary hover:text-primary transition-colors duration-200">
                  Back
                </button>
                <button onClick={() => setStep("confirm")} className="flex-1 py-4 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-300">
                  Review order
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Confirm ── */}
          {step === "confirm" && (
            <div className="flex flex-col gap-5">
              {/* Delivery summary */}
              <div className="glass rounded-3xl p-7 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl text-foreground">Delivery</h2>
                  <button onClick={() => setStep("details")} className="text-[10px] uppercase tracking-[0.14em] text-primary hover:text-accent transition-colors">Edit</button>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">{form.firstName} {form.lastName}</p>
                  <p className="text-sm text-muted-foreground">{form.address}, {form.city}, {form.state}</p>
                  <p className="text-sm text-muted-foreground">{form.phone} · {form.email}</p>
                </div>
              </div>

              {/* Payment summary */}
              <div className="glass rounded-3xl p-7 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl text-foreground">Payment</h2>
                  <button onClick={() => setStep("payment")} className="text-[10px] uppercase tracking-[0.14em] text-primary hover:text-accent transition-colors">Edit</button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {paymentMethods.find((m) => m.id === payMethod)?.label}
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("payment")} className="px-6 py-4 rounded-full border border-border text-[11px] uppercase tracking-[0.18em] text-foreground hover:border-primary hover:text-primary transition-colors duration-200">
                  Back
                </button>
                <button
                  onClick={handlePay}
                  disabled={processing}
                  className="flex-1 py-4 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Lock size={13} strokeWidth={1.5} />
                      Pay {fmt(total)}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ══════════ RIGHT COLUMN — Order summary ══════════ */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-28">
          <div className="glass rounded-3xl p-6 flex flex-col gap-5">
            <h2 className="font-display text-xl text-foreground">Order summary</h2>

            {/* Items */}
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                    <Image src={item.img} alt={item.name} fill className="object-cover" sizes="56px" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-medium">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Size {item.size}</p>
                  </div>
                  <p className="font-display text-sm text-foreground shrink-0">{fmt(item.price * item.qty)}</p>
                </div>
              ))}
            </div>

            <div className="w-full h-px bg-border" />

            {/* Promo code */}
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 border border-border rounded-full px-4 py-2.5 bg-background focus-within:border-primary transition-colors">
                <Tag size={13} strokeWidth={1.4} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Promo code"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  disabled={promoApplied}
                />
              </div>
              <button
                onClick={() => promoCode === "NOVA10" && setPromoApplied(true)}
                disabled={promoApplied}
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.14em] hover:bg-accent transition-colors duration-200 disabled:opacity-50 shrink-0"
              >
                {promoApplied ? "Applied ✓" : "Apply"}
              </button>
            </div>
            {promoApplied && (
              <p className="text-[10px] text-emerald-600 uppercase tracking-[0.14em] -mt-2">
                10% discount applied — {fmt(discount)} off
              </p>
            )}

            <div className="w-full h-px bg-border" />

            {/* Totals */}
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Subtotal",  value: fmt(subtotal) },
                { label: "Delivery",  value: fmt(DELIVERY_FEE) },
                ...(promoApplied ? [{ label: "Discount (NOVA10)", value: `−${fmt(discount)}` }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm text-foreground">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="font-display text-xl text-primary">{fmt(total)}</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {["Free returns", "Secure payment", "Ships in 2–4 days"].map((t) => (
                <span key={t} className="px-3 py-1.5 rounded-full border border-border text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
