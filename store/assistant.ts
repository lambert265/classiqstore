import { create } from "zustand";
import type { AssistantMessage, AssistantMode } from "@/lib/types";

interface AssistantStore {
  open: boolean;
  mode: AssistantMode;
  messages: AssistantMessage[];
  loading: boolean;
  setOpen: (v: boolean) => void;
  setMode: (m: AssistantMode) => void;
  addMessage: (msg: AssistantMessage) => void;
  setLoading: (v: boolean) => void;
  clearMessages: () => void;
  updateLastAssistant: (content: string) => void;
}

export const useAssistantStore = create<AssistantStore>((set, get) => ({
  open: false,
  mode: "chat",
  messages: [],
  loading: false,
  setOpen: (v) => set({ open: v }),
  setMode: (m) => set({ mode: m }),
  addMessage: (msg) => set({ messages: [...get().messages, msg] }),
  setLoading: (v) => set({ loading: v }),
  clearMessages: () => set({ messages: [] }),
  updateLastAssistant: (content) => {
    const msgs = [...get().messages];
    const last = msgs[msgs.length - 1];
    if (last?.role === "assistant") {
      msgs[msgs.length - 1] = { ...last, content };
      set({ messages: msgs });
    } else {
      set({ messages: [...msgs, { role: "assistant", content }] });
    }
  },
}));
