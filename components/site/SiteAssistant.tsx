"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, ShoppingBag, RotateCcw, Wallet, Shirt, TrendingUp, MapPin, Package } from "lucide-react";
import { useSiteAssistant } from "@/store/siteAssistant";
import { useCart } from "@/store/cart";

const SUGGESTIONS = [
  { icon: Wallet,      label: "Budget ₦100k",                  text: "What can I get for ₦100,000?" },
  { icon: ShoppingBag, label: "Review my cart",                 text: "What is in my cart?" },
  { icon: Shirt,       label: "Style the Silk Wrap Dress",      text: "How do I style the Silk Wrap Dress?" },
  { icon: TrendingUp,  label: "Best sellers",                   text: "What are your best sellers right now?" },
  { icon: Package,     label: "Track my order",                 text: "How do I track my order?" },
  { icon: MapPin,      label: "Full outfit under ₦150k",        text: "Suggest a full outfit under ₦150,000" },
];

import { CartItem } from "@/store/cart";

function buildCartSummary(items: CartItem[], total: () => number): string | null {
  if (!items.length) return null;
  const lines = items.map(
    (i) => `${i.name} (Size ${i.size}, qty ${i.qty}) at ₦${(i.price * i.qty).toLocaleString("en-NG")}`
  );
  lines.push(`Subtotal: ₦${total().toLocaleString("en-NG")}`);
  lines.push(`Delivery: ₦3,500`);
  lines.push(`Total: ₦${(total() + 3500).toLocaleString("en-NG")}`);
  return lines.join("\n");
}

export default function SiteAssistant() {
  const { open, messages, loading, setOpen, addMessage, setLoading, updateLastAssistant, clearMessages } =
    useSiteAssistant();
  const { items, total } = useCart();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  useEffect(() => {
    if (open && messages.length === 0 && items.length > 0) {
      sendMessage(
        `I have ${items.length} item${items.length > 1 ? "s" : ""} in my cart. Can you remind me what I have and help me decide if I should checkout?`,
        buildCartSummary(items, total)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function sendMessage(text: string, cartSummary?: string | null) {
    const userMsg = { role: "user" as const, content: text };
    addMessage(userMsg);
    setLoading(true);
    const allMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
    const summary = cartSummary !== undefined ? cartSummary : buildCartSummary(items, total);
    try {
      const res = await fetch("/api/site-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages, cartSummary: summary }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      updateLastAssistant("");
      setLoading(false);
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          updateLastAssistant(full);
        }
      }
    } catch {
      updateLastAssistant("Sorry, something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    sendMessage(text);
  }

  const [nudge, setNudge] = useState(false);

  // 30s nudge if user hasn't opened Nova
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setNudge(true), 30000);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => { if (open) setNudge(false); }, [open]);

  const isEmpty = messages.length === 0 && !loading;

  return (
    <>
      {/* Trigger button — desktop only (mobile uses bottom nav Nova tab) */}
      <div className="hidden lg:block fixed bottom-8 right-8 z-[65]">
        {/* Nudge tooltip */}
        {nudge && !open && (
          <div className="absolute bottom-16 right-0 w-52 bg-white border border-blue-100 rounded-2xl shadow-xl px-4 py-3 flex flex-col gap-1 animate-fade-up">
            <p className="text-xs font-medium text-foreground">Need help finding something? 👋</p>
            <p className="text-[11px] text-muted-foreground">Nova can help you shop smarter.</p>
            <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white border-r border-b border-blue-100 rotate-45" />
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Open Nova shopping assistant"
          className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)" }}
        >
          {open ? (
            <X size={20} strokeWidth={2} className="text-white" />
          ) : (
            <>
              <Sparkles size={20} strokeWidth={1.8} className="text-white" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-white text-primary text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                  {items.length}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Backdrop on mobile */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[63] bg-foreground/25 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Panel */}
      <div
        className={`fixed z-[64] bg-white flex flex-col overflow-hidden transition-all duration-300
          bottom-0 left-0 right-0 rounded-t-3xl
          lg:bottom-28 lg:left-auto lg:right-8 lg:w-[400px] lg:rounded-2xl
          border border-blue-100 shadow-2xl
          ${open ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-6 opacity-0 pointer-events-none"}
        `}
        style={{ height: "min(620px, 88dvh)" }}
      >

        {/* Header */}
        <div
          className="shrink-0 px-5 py-4 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-white" strokeWidth={1.8} />
              <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white/30" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">Nova</p>
              <p className="text-white/55 text-[10px] tracking-wide mt-0.5">CLASSIQ Personal Stylist. Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                title="Clear chat"
                className="w-8 h-8 rounded-xl hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <RotateCcw size={14} />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-xl hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col gap-5">
              {/* Greeting */}
              <div className="flex flex-col items-center text-center gap-3 pt-1">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)" }}
                >
                  <Sparkles size={26} className="text-white" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-foreground text-base">Hi, I am Nova 👋</p>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                    Tell me your budget or ask about any piece. I am here to help you shop smarter.
                  </p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Products", value: "8+" },
                  { label: "Delivery", value: "₦3.5k" },
                  { label: "Response", value: "Instant" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-blue-50 border border-blue-100 rounded-xl px-2 py-3 text-center">
                    <p className="text-sm font-semibold text-primary">{value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Suggestion cards */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Try asking</p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTIONS.map(({ icon: Icon, label, text }) => (
                    <button
                      key={label}
                      onClick={() => sendMessage(text)}
                      className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-blue-100 bg-blue-50/60 text-left hover:bg-primary hover:text-white hover:border-primary transition-all duration-150 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/10 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
                        <Icon size={13} className="text-primary group-hover:text-white transition-colors" strokeWidth={1.8} />
                      </div>
                      <span className="text-xs text-foreground group-hover:text-white leading-tight transition-colors">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center mb-0.5"
                  style={{ background: "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)" }}
                >
                  <Sparkles size={12} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[78%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.role === "user"
                    ? "rounded-2xl rounded-br-sm text-white"
                    : "rounded-2xl rounded-bl-sm bg-white border border-blue-100 text-foreground"
                }`}
                style={msg.role === "user" ? { background: "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)" } : {}}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing dots */}
          {loading && (
            <div className="flex items-end gap-2 justify-start">
              <div
                className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)" }}
              >
                <Sparkles size={12} className="text-white" />
              </div>
              <div className="bg-white border border-blue-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                {[0, 1, 2].map((j) => (
                  <span
                    key={j}
                    className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                    style={{ animationDelay: `${j * 0.18}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Cart nudge */}
          {!loading && messages.length > 0 && items.length > 0 && (
            <button
              onClick={() => sendMessage("What is in my cart and should I checkout now?")}
              className="self-center flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium hover:bg-primary hover:text-white transition-all duration-200"
            >
              <ShoppingBag size={12} strokeWidth={2} />
              {items.length} item{items.length > 1 ? "s" : ""} in your bag. Checkout?
            </button>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Mid chat quick suggestions */}
        {messages.length > 0 && !loading && (
          <div className="shrink-0 px-4 py-2.5 border-t border-blue-50 flex gap-2 overflow-x-auto scrollbar-none">
            {SUGGESTIONS.slice(0, 4).map(({ icon: Icon, label, text }) => (
              <button
                key={label}
                onClick={() => sendMessage(text)}
                className="shrink-0 flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50 text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-150 whitespace-nowrap"
              >
                <Icon size={11} strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="shrink-0 px-4 py-3 border-t border-blue-100 bg-white flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Budget, styling, navigation..."
            className="flex-1 bg-[#f0f6ff] border border-blue-100 rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-35 hover:opacity-90 active:scale-95 transition-all shrink-0"
            style={{ background: "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)" }}
          >
            <Send size={15} strokeWidth={2} />
          </button>
        </form>
      </div>
    </>
  );
}
