"use client";
import { Sparkles } from "lucide-react";
import { useAssistantStore } from "@/store/assistant";

export default function AssistantBubble() {
  const { open, setOpen } = useAssistantStore();
  if (open) return null;
  return (
    <button
      onClick={() => setOpen(true)}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      title="Ask Knotté"
    >
      <Sparkles size={22} strokeWidth={1.8} />
    </button>
  );
}
