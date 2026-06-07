"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="max-w-md mx-auto px-6">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary mb-3">Delivery</p>
        <h1 className="font-heading text-4xl text-foreground mb-4">Track Your Order</h1>
        <p className="text-muted-foreground">Enter your order ID and email address to see the latest status.</p>
      </div>

      {submitted ? (
        <div className="p-6 rounded-2xl bg-muted text-center flex flex-col gap-3">
          <p className="font-heading text-xl text-foreground">Order #{orderId}</p>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find this order. Please check your details or{" "}
            <a href="/contact" className="text-primary underline hover:text-accent transition-colors">contact support</a>.
          </p>
          <button
            onClick={() => { setSubmitted(false); setOrderId(""); setEmail(""); }}
            className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary transition-colors"
          >
            Try again
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            value={orderId} onChange={(e) => setOrderId(e.target.value)} required
            placeholder="Order ID (e.g. CLQ-00123)"
            className="w-full px-5 py-3.5 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
          <input
            value={email} onChange={(e) => setEmail(e.target.value)} required type="email"
            placeholder="Email address used at checkout"
            className="w-full px-5 py-3.5 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-300"
          >
            <Search size={14} strokeWidth={1.5} />
            Track order
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Signed in?{" "}
        <Link href="/profile" className="text-primary hover:text-accent transition-colors underline">
          View all your orders
        </Link>{" "}
        in your account.
      </p>
    </div>
  );
}
