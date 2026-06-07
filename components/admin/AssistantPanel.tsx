"use client";

import { useRef, useEffect, useState } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { useAssistantStore } from "@/store/assistant";
import type { AssistantMode } from "@/lib/types";

const MODES: { id: AssistantMode; label: string }[] = [
  { id: "chat",    label: "Chat" },
  { id: "insight", label: "Insights" },
  { id: "plan",    label: "Planning" },
  { id: "content", label: "Content" },
];

export default function AssistantPanel() {
  const { open, setOpen, mode, setMode, messages, loading, addMessage, setLoading, updateLastAssistant } = useAssistantStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    addMessage({ role: "user", content: text });
    setLoading(true);
    addMessage({ role: "assistant", content: "" });

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: text }], mode }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        updateLastAssistant(full);
      }
    } catch {
      updateLastAssistant("Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`fixed top-0 right-0 h-screen w-full max-w-sm z-50 bg-white shadow-2xl border-l border-blue-500/10 flex flex-col transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-blue-500/10 bg-gradient-to-r from-blue-500 to-blue-600">
        <Sparkles size={18} className="text-white" />
        <span className="font-semibold text-white flex-1">Knotté AI</span>
        <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 px-4 py-3 border-b border-blue-500/10">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === m.id ? "bg-blue-500 text-white" : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Sparkles size={20} className="text-blue-500" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Hi, I&apos;m Knotté</p>
            <p className="text-xs text-slate-400">Your AI store analyst. Ask me about revenue, orders, products, or get content ideas.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              }`}
            >
              {msg.content || (loading && i === messages.length - 1 ? (
                <span className="flex gap-1 items-center py-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              ) : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-blue-500/10">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Ask Knotté (${mode} mode)…`}
            rows={1}
            className="flex-1 resize-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all max-h-28 overflow-y-auto"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-40 shrink-0"
          >
            <Send size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
