import { create } from "zustand";

export interface SiteMessage {
  role: "user" | "assistant";
  content: string;
}

interface SiteAssistantStore {
  open: boolean;
  messages: SiteMessage[];
  loading: boolean;
  setOpen: (v: boolean) => void;
  addMessage: (msg: SiteMessage) => void;
  setLoading: (v: boolean) => void;
  updateLastAssistant: (content: string) => void;
  clearMessages: () => void;
}

export const useSiteAssistant = create<SiteAssistantStore>((set, get) => ({
  open: false,
  messages: [],
  loading: false,
  setOpen: (v) => set({ open: v }),
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
