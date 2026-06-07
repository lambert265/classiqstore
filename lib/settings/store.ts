import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { validateSettingValue, type SettingType } from "./validation";

export interface Setting {
  key: string;
  value: string;
  label: string;
  description: string;
  type: SettingType;
  category_id: string;
  options?: string[];
  is_public: boolean;
  sort_order: number;
  updated_at: string;
}

export interface SettingCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  sort_order: number;
}

export interface SettingVersion {
  id: string;
  setting_key: string;
  old_value: string;
  new_value: string;
  changed_at: string;
  note?: string;
}

interface SettingsStore {
  settings: Record<string, Setting>;
  categories: SettingCategory[];
  versions: SettingVersion[];
  unsaved: Record<string, string>;
  errors: Record<string, string>;
  loading: boolean;
  saving: boolean;
  lastFetch: number;
  search: string;

  load: () => Promise<void>;
  set: (key: string, value: string) => void;
  save: () => Promise<void>;
  reset: () => void;
  rollback: (version: SettingVersion) => Promise<void>;
  loadVersions: (key: string) => Promise<void>;
  setSearch: (q: string) => void;
  exportJSON: () => string;
  importJSON: (json: string) => { ok: boolean; error?: string };
  subscribeRealtime: () => () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: {},
  categories: [],
  versions: [],
  unsaved: {},
  errors: {},
  loading: false,
  saving: false,
  lastFetch: 0,
  search: "",

  load: async () => {
    const now = Date.now();
    if (now - get().lastFetch < CACHE_TTL && Object.keys(get().settings).length > 0) return;
    set({ loading: true });
    const sb = createClient();
    const [{ data: settingsData }, { data: catsData }] = await Promise.all([
      sb.from("settings").select("*").order("sort_order"),
      sb.from("setting_categories").select("*").order("sort_order"),
    ]);
    const map: Record<string, Setting> = {};
    (settingsData ?? []).forEach((s: Setting) => { map[s.key] = s; });
    set({
      settings: map,
      categories: (catsData ?? []) as SettingCategory[],
      loading: false,
      lastFetch: Date.now(),
    });
  },

  set: (key, value) => {
    const setting = get().settings[key];
    const error = setting ? validateSettingValue(value, setting.type, setting.options) : null;
    set((s) => ({
      unsaved: { ...s.unsaved, [key]: value },
      errors: error
        ? { ...s.errors, [key]: error }
        : Object.fromEntries(Object.entries(s.errors).filter(([k]) => k !== key)),
    }));
  },

  save: async () => {
    const { unsaved, errors, settings } = get();
    if (Object.keys(errors).length > 0) return;
    set({ saving: true });
    const sb = createClient();
    const now = new Date().toISOString();

    await Promise.all(
      Object.entries(unsaved).map(async ([key, value]) => {
        const old = settings[key]?.value ?? "";
        await sb.from("settings").upsert({ key, value, updated_at: now });
        if (old !== value) {
          await sb.from("setting_versions").insert({ setting_key: key, old_value: old, new_value: value });
        }
      })
    );

    // Merge unsaved into settings
    set((s) => {
      const updated = { ...s.settings };
      Object.entries(s.unsaved).forEach(([key, value]) => {
        if (updated[key]) updated[key] = { ...updated[key], value, updated_at: now };
      });
      return { settings: updated, unsaved: {}, saving: false };
    });
  },

  reset: () => set({ unsaved: {}, errors: {} }),

  rollback: async (version) => {
    const sb = createClient();
    const now = new Date().toISOString();
    await sb.from("settings").upsert({ key: version.setting_key, value: version.old_value, updated_at: now });
    await sb.from("setting_versions").insert({
      setting_key: version.setting_key,
      old_value: get().settings[version.setting_key]?.value ?? "",
      new_value: version.old_value,
      note: `Rollback to version from ${version.changed_at}`,
    });
    set((s) => ({
      settings: {
        ...s.settings,
        [version.setting_key]: { ...s.settings[version.setting_key], value: version.old_value },
      },
    }));
  },

  loadVersions: async (key) => {
    const { data } = await createClient()
      .from("setting_versions")
      .select("*")
      .eq("setting_key", key)
      .order("changed_at", { ascending: false })
      .limit(20);
    set({ versions: (data ?? []) as SettingVersion[] });
  },

  setSearch: (q) => set({ search: q }),

  exportJSON: () => {
    const { settings } = get();
    const out: Record<string, string> = {};
    Object.values(settings).forEach((s) => { out[s.key] = s.value; });
    return JSON.stringify(out, null, 2);
  },

  importJSON: (json) => {
    try {
      const parsed = JSON.parse(json);
      if (typeof parsed !== "object" || Array.isArray(parsed)) return { ok: false, error: "Must be a JSON object" };
      const { settings } = get();
      const newUnsaved: Record<string, string> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value !== "string") return { ok: false, error: `Value for "${key}" must be a string` };
        if (!settings[key]) return { ok: false, error: `Unknown key: "${key}"` };
        newUnsaved[key] = value;
      }
      set((s) => ({ unsaved: { ...s.unsaved, ...newUnsaved } }));
      return { ok: true };
    } catch {
      return { ok: false, error: "Invalid JSON" };
    }
  },

  subscribeRealtime: () => {
    const sb = createClient();
    let retries = 0;
    const connect = () => {
      const channel = sb.channel("settings-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, (payload) => {
          const row = payload.new as Setting;
          if (!row?.key) return;
          set((s) => ({ settings: { ...s.settings, [row.key]: { ...s.settings[row.key], ...row } } }));
          retries = 0;
        })
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") {
            const delay = Math.min(1000 * 2 ** retries, 30000);
            retries++;
            setTimeout(connect, delay);
          }
        });
      return () => { sb.removeChannel(channel); };
    };
    return connect();
  },
}));
