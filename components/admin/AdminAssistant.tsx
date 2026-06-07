"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, Bot, ChevronDown, MessageCircle, Sparkles, TrendingUp, RefreshCw, Map, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message { role: "user" | "assistant"; content: string; }
type Mode = "chat" | "insight" | "plan" | "content";

const QUICK_PROMPTS = [
  "What's my best selling product?",
  "Which products are low on stock?",
  "How is revenue trending this month?",
  "What custom orders need attention?",
  "Suggest a pricing strategy for new items",
  "What should I restock first?",
];

const INSIGHT_PROMPTS = [
  "Give me today's business briefing",
  "What's my biggest growth opportunity?",
  "Where am I losing money?",
  "What should I focus on this week?",
];

const PLAN_PROMPTS = [
  "Build me a 30-day Instagram content calendar",
  "How do I hit ₦1M revenue this month?",
  "Plan a product launch campaign for a new item",
  "Write 5 Instagram captions with hashtags for my crochet pieces",
  "Give me a TikTok strategy to grow my brand",
  "Plan a flash sale campaign for this weekend",
  "How do I grow my email subscriber list?",
  "Suggest a WhatsApp marketing strategy for Nigerian customers",
];

const CONTENT_PROMPTS = [
  "Give me 5 TikTok video ideas for my top product",
  "Write 3 Instagram captions with hashtags",
  "Plan a 7-day content calendar for this week",
  "Write a hook for a crochet Reel that stops the scroll",
  "Suggest a behind-the-scenes content idea",
  "What should I post to announce a new product drop?",
  "Give me Pinterest board ideas for my brand",
  "Write a WhatsApp broadcast message for my customers",
];

const INIT: Record<Mode, string> = {
  chat:    "Knotté here. I have live access to your store data — revenue, orders, products, inventory, and custom requests. What do you need to know?",
  insight: "Ready to run a full data analysis on your store. Tap **Get Today's Briefing** for an instant snapshot, or ask me anything specific.",
  plan:    "Plan mode. Tell me what you want to achieve — a revenue target, a campaign, a content calendar — and I'll build it out using your actual store data.",
  content: "Content mode. I'll write platform-specific content grounded in what's actually selling in your store. What do you need?",
};

const TABS: { key: Mode; label: string; icon: React.ElementType }[] = [
  { key: "chat",    label: "Chat",     icon: MessageCircle },
  { key: "insight", label: "Insights", icon: TrendingUp },
  { key: "plan",    label: "Plan",     icon: Map },
  { key: "content", label: "Content",  icon: Palette },
];

const refreshLabels: Record<string, string> = {
  insight: "Refresh Insights",
  plan:    "New Strategy Idea",
  content: "Fresh Content Ideas",
};

const refreshPrompts: Record<string, string> = {
  insight: "Refresh my business briefing with the latest data",
  plan:    "Give me a new strategy idea based on my current store data",
  content: "Give me fresh content ideas based on what's selling right now",
};

const placeholders: Record<Mode, string> = {
  chat:    "Ask anything about your business...",
  insight: "Ask about your store performance...",
  plan:    "What do you want to plan or strategise?",
  content: "Ask for content ideas, captions, hooks...",
};

export default function AdminAssistant() {
  const [open, setOpen]       = useState(false);
  const [mode, setMode]       = useState<Mode>("chat");
  const [threads, setThreads] = useState<Record<Mode, Message[]>>({
    chat:    [{ role: "assistant", content: INIT.chat }],
    insight: [{ role: "assistant", content: INIT.insight }],
    plan:    [{ role: "assistant", content: INIT.plan }],
    content: [{ role: "assistant", content: INIT.content }],
  });
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const activeMessages = threads[mode];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [threads, mode, streaming]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const send = useCallback(async (text?: string, forMode?: Mode) => {
    const msg = (text ?? input).trim();
    if (!msg || loading || streaming) return;
    setInput("");

    const targetMode = forMode ?? mode;
    const current    = threads[targetMode];
    const newMessages: Message[] = [...current, { role: "user", content: msg }];

    setThreads(prev => ({ ...prev, [targetMode]: newMessages }));
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, mode: targetMode }),
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      setLoading(false);
      setStreaming(true);
      setThreads(prev => ({ ...prev, [targetMode]: [...newMessages, { role: "assistant", content: "" }] }));

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setThreads(prev => {
          const updated = [...prev[targetMode]];
          updated[updated.length - 1] = { role: "assistant", content: accumulated };
          return { ...prev, [targetMode]: updated };
        });
      }
    } catch {
      setThreads(prev => ({ ...prev, [targetMode]: [...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }] }));
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }, [input, loading, streaming, mode, threads]);

  function clearChat() {
    setThreads(prev => ({ ...prev, [mode]: [{ role: "assistant", content: INIT[mode] }] }));
  }

  return (
    <>
      <div className={cn(
        "fixed z-50 transition-all duration-300 ease-out",
        "bottom-0 right-0 w-full sm:bottom-24 sm:right-6 sm:w-[420px]",
        open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        <div className="bg-[#0a1a10] border border-[#4ade80]/20 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
          style={{ height: "min(640px, 90vh)" }}>

          <div className="flex items-center justify-between px-5 py-3.5 bg-[#0d1f16] border-b border-white/6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#4ade80]/15 border border-[#4ade80]/25 flex items-center justify-center shrink-0">
                <Bot size={15} className="text-[#4ade80]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white font-body leading-none">Knotté AI</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                  <span className="text-[10px] text-white/35 font-body">Live store data · Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {activeMessages.length > 1 && (
                <button onClick={clearChat}
                  className="text-[10px] font-body text-white/25 hover:text-white/60 px-2 py-1 rounded-lg hover:bg-white/6 transition-all">
                  Clear
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-xl hover:bg-white/8 flex items-center justify-center text-white/35 hover:text-white transition-colors">
                <ChevronDown size={15} />
              </button>
            </div>
          </div>

          <div className="flex gap-1 px-4 pt-3 pb-2 shrink-0 overflow-x-auto">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setMode(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body transition-all shrink-0",
                  mode === key
                    ? "bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/25"
                    : "text-white/35 hover:text-white/60 hover:bg-white/5"
                )}>
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3 min-h-0">
            {activeMessages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-lg bg-[#4ade80]/15 border border-[#4ade80]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={11} className="text-[#4ade80]" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[84%] px-3.5 py-2.5 rounded-2xl text-sm font-body leading-relaxed whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-[#1B4332] text-white rounded-br-sm border border-[#2D6A4F]/60"
                    : "bg-white/5 text-white/85 rounded-bl-sm border border-white/6"
                )}>
                  {m.content}
                  {streaming && i === activeMessages.length - 1 && m.role === "assistant" && (
                    <span className="inline-block w-1.5 h-3.5 bg-[#4ade80]/70 ml-0.5 animate-pulse rounded-sm align-middle" />
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-lg bg-[#4ade80]/15 border border-[#4ade80]/20 flex items-center justify-center shrink-0">
                  <Bot size={11} className="text-[#4ade80]" />
                </div>
                <div className="bg-white/5 border border-white/6 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 size={12} className="text-[#4ade80] animate-spin" />
                  <span className="text-xs text-white/35 font-body">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {activeMessages.length === 1 && (
            <div className="px-4 pb-2 shrink-0">
              {mode === "insight" ? (
                <>
                  <button onClick={() => send("Give me today's business briefing", "insight")}
                    disabled={loading || streaming}
                    className="w-full flex items-center justify-center gap-2 bg-[#4ade80]/10 border border-[#4ade80]/25 text-[#4ade80] text-xs font-body font-semibold py-2.5 rounded-xl hover:bg-[#4ade80]/20 transition-all mb-2 disabled:opacity-40">
                    <Sparkles size={12} />
                    Get Today&apos;s Briefing
                  </button>
                  <div className="grid grid-cols-2 gap-1.5">
                    {INSIGHT_PROMPTS.slice(1).map(q => (
                      <button key={q} onClick={() => send(q, "insight")}
                        className="text-left text-[11px] font-body text-white/45 hover:text-white bg-white/4 hover:bg-[#1B4332] border border-white/6 hover:border-[#4ade80]/30 px-3 py-2 rounded-xl transition-all leading-snug">
                        {q}
                      </button>
                    ))}
                  </div>
                </>
              ) : mode === "plan" ? (
                <>
                  <p className="text-[9px] tracking-widest uppercase text-white/20 font-body mb-2">Strategy & planning</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {PLAN_PROMPTS.map(q => (
                      <button key={q} onClick={() => send(q, "plan")}
                        className="text-left text-[11px] font-body text-white/45 hover:text-white bg-white/4 hover:bg-[#1B4332] border border-white/6 hover:border-[#4ade80]/30 px-3 py-2 rounded-xl transition-all leading-snug">
                        {q}
                      </button>
                    ))}
                  </div>
                </>
              ) : mode === "content" ? (
                <>
                  <p className="text-[9px] tracking-widest uppercase text-white/20 font-body mb-2">Content & social ideas</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {CONTENT_PROMPTS.map(q => (
                      <button key={q} onClick={() => send(q, "content")}
                        className="text-left text-[11px] font-body text-white/45 hover:text-white bg-white/4 hover:bg-[#1B4332] border border-white/6 hover:border-[#4ade80]/30 px-3 py-2 rounded-xl transition-all leading-snug">
                        {q}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[9px] tracking-widest uppercase text-white/20 font-body mb-2">Ask about your store</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_PROMPTS.map(q => (
                      <button key={q} onClick={() => send(q)}
                        className="text-left text-[11px] font-body text-white/45 hover:text-white bg-white/4 hover:bg-[#1B4332] border border-white/6 hover:border-[#4ade80]/30 px-3 py-2 rounded-xl transition-all leading-snug">
                        {q}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {mode !== "chat" && activeMessages.length > 1 && refreshLabels[mode] && (
            <div className="px-4 pb-2 shrink-0">
              <button onClick={() => send(refreshPrompts[mode], mode)}
                disabled={loading || streaming}
                className="w-full flex items-center justify-center gap-2 bg-white/4 border border-white/8 text-white/40 hover:text-white text-xs font-body py-2 rounded-xl hover:bg-white/8 transition-all disabled:opacity-40">
                <RefreshCw size={11} />
                {refreshLabels[mode]}
              </button>
            </div>
          )}

          <div className="px-4 pb-4 pt-2 flex gap-2 shrink-0 border-t border-white/5">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={placeholders[mode]}
              className="flex-1 bg-white/5 border border-white/8 text-white placeholder-white/20 font-body text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#4ade80]/40 transition-colors"
            />
            <button onClick={() => send()} disabled={loading || streaming || !input.trim()}
              className="w-10 h-10 rounded-xl bg-[#4ade80] text-[#0d1f16] flex items-center justify-center hover:bg-[#22c55e] transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
              <Send size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <button onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105",
          open
            ? "bg-white/10 border border-white/15 text-white"
            : "bg-[#4ade80] text-[#0d1f16] shadow-[#4ade80]/25"
        )}>
        {open ? <X size={20} /> : <Bot size={22} />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#f59e0b] rounded-full border-2 border-[#0d1f16] flex items-center justify-center">
            <Sparkles size={9} className="text-[#0d1f16]" />
          </span>
        )}
      </button>
    </>
  );
}
