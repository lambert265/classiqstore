"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="bg-primary py-24 px-6">
      <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-8">
        {subscribed ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle size={36} strokeWidth={1.4} className="text-primary-foreground/60" />
            <h2 className="font-display text-4xl text-primary-foreground">You&apos;re in.</h2>
            <p className="text-sm text-primary-foreground/60">Check your inbox. Your 10% off code is on its way.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4">
              <p className="text-[10px] uppercase tracking-[0.32em] text-primary-foreground/40">Join the Circle</p>
              <h2 className="font-display text-4xl md:text-5xl text-primary-foreground leading-snug">
                Get 10% off your<br />first order.
              </h2>
              <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-sm">
                Subscribe for early access to new drops, exclusive offers and style notes from the CLASSIQ edit.
              </p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); setSubscribed(true); setEmail(""); }}
              className="flex w-full max-w-md rounded-full overflow-hidden border border-primary-foreground/20"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-primary-foreground/10 px-6 py-4 text-sm text-primary-foreground placeholder:text-primary-foreground/30 outline-none"
              />
              <button
                type="submit"
                className="bg-primary-foreground text-primary px-7 py-4 text-[10px] uppercase tracking-[0.18em] hover:bg-accent hover:text-primary-foreground transition-colors duration-300 shrink-0 rounded-full"
              >
                Subscribe
              </button>
            </form>

            <p className="text-[9px] uppercase tracking-[0.2em] text-primary-foreground/30">
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
