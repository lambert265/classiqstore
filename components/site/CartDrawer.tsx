"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCart } from "@/store/cart";

const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const DELIVERY_FEE = 3500;

export default function CartDrawer() {
  const { items, open, setOpen, removeItem, updateQty, clear, total, count } = useCart();

  const subtotal = total();
  const itemCount = count();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[80] bg-foreground/30 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md z-[90] bg-background flex flex-col transition-transform duration-500 ease-out shadow-2xl ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl tracking-[-0.01em]">Your Bag</h2>
            {itemCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors duration-200"
          >
            <X size={16} strokeWidth={1.6} />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag size={24} strokeWidth={1.3} className="text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-display text-2xl text-foreground">Your bag is empty</p>
              <p className="text-sm text-muted-foreground">Add pieces you love to get started.</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-300"
            >
              Continue shopping
            </button>
          </div>
        )}

        {/* Items list */}
        {items.length > 0 && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="bg-white border border-blue-100 rounded-2xl p-4 flex gap-4">
                  {/* Image */}
                  <Link href={`/products/${item.id}`} onClick={() => setOpen(false)} className="relative w-20 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                    <Image src={item.img} alt={item.name} fill className="object-cover" sizes="80px" />
                  </Link>

                  {/* Info */}
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <Link href={`/products/${item.id}`} onClick={() => setOpen(false)} className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate">
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2">
                          {/* Colour dot */}
                          <span className="w-3 h-3 rounded-full border border-border/60 shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Size {item.size}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        className="text-muted-foreground hover:text-rose-500 transition-colors shrink-0 mt-0.5"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      {/* Qty controls */}
                      <div className="flex items-center gap-1 border border-border rounded-full px-1 py-1">
                        <button
                          onClick={() => updateQty(item.id, item.size, item.color, item.qty - 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                        >
                          <Minus size={11} strokeWidth={2} />
                        </button>
                        <span className="text-sm font-medium text-foreground w-6 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.size, item.color, item.qty + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                        >
                          <Plus size={11} strokeWidth={2} />
                        </button>
                      </div>
                      <p className="font-display text-base text-foreground">{fmt(item.price * item.qty)}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear all */}
              <button
                onClick={clear}
                className="self-start text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-rose-500 transition-colors"
              >
                Clear bag
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-6 flex flex-col gap-4 shrink-0 bg-background">
              {/* Free delivery progress */}
              {(() => {
                const FREE_DELIVERY_AT = 80000;
                const remaining = FREE_DELIVERY_AT - subtotal;
                const pct = Math.min((subtotal / FREE_DELIVERY_AT) * 100, 100);
                return (
                  <div className="flex flex-col gap-1.5">
                    <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      {remaining > 0
                        ? <>Spend <span className="text-primary font-medium">₦{remaining.toLocaleString("en-NG")}</span> more for free delivery</>
                        : <span className="text-primary font-medium">You have unlocked free delivery!</span>
                      }
                    </p>
                  </div>
                );
              })()}
              {/* Totals */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground">{fmt(DELIVERY_FEE)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-medium text-foreground">Total</span>
                  <span className="font-display text-xl text-primary">{fmt(subtotal + DELIVERY_FEE)}</span>
                </div>
              </div>

              {/* CTAs */}
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="w-full py-4 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] text-center hover:bg-accent transition-colors duration-300 flex items-center justify-center gap-2"
              >
                Checkout
                <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="w-full py-3.5 rounded-full border border-border text-[11px] uppercase tracking-[0.18em] text-foreground hover:border-primary hover:text-primary transition-colors duration-200"
              >
                Continue shopping
              </button>

              {/* Trust + payment icons */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-4">
                  {["Free returns", "Secure checkout"].map((t) => (
                    <span key={t} className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {["Paystack", "Bank Transfer", "Card"].map((m) => (
                    <span key={m} className="px-2.5 py-1 rounded-md border border-blue-100 text-[9px] uppercase tracking-[0.1em] text-muted-foreground bg-blue-50">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
