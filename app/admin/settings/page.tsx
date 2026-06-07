"use client";

import { useEffect, useState, useRef } from "react";
import {
  Save, RotateCcw, Search, Download, Upload, Clock,
  ChevronDown, Check, AlertTriangle, X, Bell, Sparkles,
  Store, Palette, ShoppingBag, Shield, RefreshCw,
} from "lucide-react";
import { useSettingsStore, type Setting, type SettingVersion } from "@/lib/settings/store";

const ICON_MAP: Record<string, React.ReactNode> = {
  Store:       <Store size={14} />,
  Palette:     <Palette size={14} />,
  ShoppingBag: <ShoppingBag size={14} />,
  Bell:        <Bell size={14} />,
  Sparkles:    <Sparkles size={14} />,
  Shield:      <Shield size={14} />,
};

/* ── Toggle ────────────────────────────────────────────────────── */
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${value ? "bg-[#C9A84C]" : "bg-white/10"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 flex items-center justify-center ${value ? "translate-x-5" : "translate-x-0"}`}>
        {value && <Check size={10} strokeWidth={2.5} className="text-[#0f0d0b]" />}
      </span>
    </button>
  );
}

/* ── Setting control ────────────────────────────────────────────── */
function SettingControl({ setting, value, error, onChange }: {
  setting: Setting; value: string; error?: string; onChange: (v: string) => void;
}) {
  const base = "bg-white/5 border text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none transition-all font-body placeholder-white/20";
  const borderCls = error ? "border-red-500/50 focus:border-red-400" : "border-white/8 focus:border-[#C9A84C]/40";

  if (setting.type === "boolean") {
    return (
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-white">{setting.label}</span>
          <span className="text-[11px] text-white/40">{setting.description}</span>
        </div>
        <Toggle value={value === "true"} onChange={(v) => onChange(String(v))} />
      </div>
    );
  }

  if (setting.type === "color") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">{setting.label}</label>
        <div className="flex items-center gap-3">
          <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-xl border border-white/8 bg-transparent cursor-pointer" />
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
            className={`${base} ${borderCls} flex-1`} placeholder="#000000" />
        </div>
        {error && <p className="text-[11px] text-red-400">{error}</p>}
      </div>
    );
  }

  if (setting.type === "textarea") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">{setting.label}</label>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
          className={`${base} ${borderCls} w-full resize-none`} placeholder={setting.description} />
        {error && <p className="text-[11px] text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body">{setting.label}</label>
      <p className="text-[11px] text-white/30 font-body">{setting.description}</p>
      <input
        type={setting.type === "number" ? "number" : setting.type === "email" ? "email" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${base} ${borderCls} w-full`}
        placeholder={setting.description}
      />
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

/* ── Version history panel ──────────────────────────────────────── */
function VersionPanel({ settingKey, onClose, onRollback }: {
  settingKey: string; onClose: () => void; onRollback: (v: SettingVersion) => void;
}) {
  const { versions, loadVersions } = useSettingsStore();
  useEffect(() => { loadVersions(settingKey); }, [settingKey]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a0806] border border-white/8 rounded-2xl w-full max-w-md mx-4 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-body">Version History</p>
            <h3 className="text-white font-heading font-semibold">{settingKey}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto max-h-80 p-4 flex flex-col gap-2">
          {versions.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8 font-body">No version history yet</p>
          ) : versions.map((v) => (
            <div key={v.id} className="bg-white/4 border border-white/6 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-white/30 font-body">{new Date(v.changed_at).toLocaleString()}</p>
                <button onClick={() => onRollback(v)}
                  className="text-[10px] uppercase tracking-[0.14em] text-[#C9A84C] hover:text-[#e8c86a] transition-colors font-body">
                  Rollback
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs font-body">
                <span className="text-red-400/70 line-through truncate max-w-[120px]">{v.old_value || "empty"}</span>
                <span className="text-white/30">→</span>
                <span className="text-emerald-400/70 truncate max-w-[120px]">{v.new_value || "empty"}</span>
              </div>
              {v.note && <p className="text-[10px] text-white/25 italic font-body">{v.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Bulk Import modal ──────────────────────────────────────────── */
function ImportModal({ onClose }: { onClose: () => void }) {
  const { importJSON } = useSettingsStore();
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  function doImport() {
    const r = importJSON(text);
    setResult(r);
    if (r.ok) setTimeout(onClose, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a0806] border border-white/8 rounded-2xl w-full max-w-md mx-4 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
          <h3 className="text-white font-heading font-semibold">Import Settings JSON</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors"><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8}
            placeholder={'{\n  "store_name": "CLASSIQ",\n  "delivery_fee": "3500"\n}'}
            className="w-full bg-white/5 border border-white/8 text-white text-xs px-4 py-3 rounded-xl focus:outline-none focus:border-[#C9A84C]/40 transition-all font-mono resize-none" />
          {result && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${result.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {result.ok ? <Check size={14} /> : <AlertTriangle size={14} />}
              {result.ok ? "Imported successfully" : result.error}
            </div>
          )}
          <button onClick={doImport} disabled={!text.trim()}
            className="w-full py-3 rounded-xl bg-[#C9A84C] text-[#0f0d0b] font-semibold text-sm btn-3d btn-3d-gold font-body disabled:opacity-40">
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────── */
export default function SettingsPage() {
  const {
    settings, categories, unsaved, errors, loading, saving,
    load, set, save, reset, rollback, setSearch, search, exportJSON, subscribeRealtime,
  } = useSettingsStore();

  const [activeCategory, setActiveCategory] = useState("general");
  const [versionKey, setVersionKey] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [saved, setSaved] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    load();
    unsubRef.current = subscribeRealtime();
    return () => { unsubRef.current?.(); };
  }, []);

  async function handleSave() {
    await save();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const hasUnsaved = Object.keys(unsaved).length > 0;
  const hasErrors  = Object.keys(errors).length > 0;

  const allSettings = Object.values(settings);
  const filtered = search
    ? allSettings.filter(s =>
        s.label?.toLowerCase().includes(search.toLowerCase()) ||
        s.key.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
      )
    : allSettings.filter(s => s.category_id === activeCategory);

  const getValue = (key: string) => unsaved[key] ?? settings[key]?.value ?? "";

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]/60 font-body mb-1">Admin</p>
          <h1 className="font-heading text-3xl font-bold text-white">Settings</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-xs text-white/60 hover:text-white hover:bg-white/8 transition-all font-body">
            <Upload size={13} /> Import
          </button>
          <button onClick={() => {
            const blob = new Blob([exportJSON()], { type: "application/json" });
            const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
            a.download = "classiq-settings.json"; a.click();
          }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-xs text-white/60 hover:text-white hover:bg-white/8 transition-all font-body">
            <Download size={13} /> Export
          </button>
          {hasUnsaved && (
            <button onClick={reset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-xs text-white/60 hover:text-white transition-all font-body">
              <RotateCcw size={13} /> Discard
            </button>
          )}
          <button onClick={handleSave} disabled={saving || !hasUnsaved || hasErrors}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#0f0d0b] font-semibold text-sm btn-3d btn-3d-gold font-body disabled:opacity-40">
            {saved ? <><Check size={14} /> Saved</> : saving ? <><RefreshCw size={14} className="animate-spin" /> Saving</> : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Unsaved banner */}
      {hasUnsaved && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#C9A84C]/10 border border-[#C9A84C]/25 rounded-xl text-sm text-[#C9A84C] font-body">
          <AlertTriangle size={15} />
          {Object.keys(unsaved).length} unsaved change{Object.keys(unsaved).length > 1 ? "s" : ""}
          {hasErrors && <span className="text-red-400 ml-2">— fix validation errors before saving</span>}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search settings..."
          className="w-full bg-[#0a0806] border border-white/8 text-white text-sm pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#C9A84C]/40 transition-all font-body placeholder-white/20"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">

        {/* Sidebar categories */}
        {!search && (
          <div className="lg:w-52 shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {categories.map((cat) => {
              const catSettings = allSettings.filter(s => s.category_id === cat.id);
              const catUnsaved  = catSettings.filter(s => s.key in unsaved).length;
              const catErrors   = catSettings.filter(s => s.key in errors).length;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all font-body shrink-0 ${
                    activeCategory === cat.id
                      ? "bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30"
                      : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}>
                  <span className={activeCategory === cat.id ? "text-[#C9A84C]" : "text-white/30"}>{ICON_MAP[cat.icon]}</span>
                  <span className="flex-1 text-left">{cat.label}</span>
                  {catErrors > 0 && <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">{catErrors}</span>}
                  {catErrors === 0 && catUnsaved > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Settings panel */}
        <div className="flex-1 flex flex-col gap-3">
          {loading ? (
            <div className="bg-[#0a0806] border border-white/8 rounded-2xl p-10 flex items-center justify-center text-white/20 font-body text-sm">
              Loading settings...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#0a0806] border border-white/8 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
              <Search size={24} className="text-white/20" />
              <p className="text-white/30 text-sm font-body">No settings found{search ? ` for "${search}"` : ""}</p>
            </div>
          ) : (
            <>
              {/* Group booleans separately */}
              {(() => {
                const bools    = filtered.filter(s => s.type === "boolean");
                const nonBools = filtered.filter(s => s.type !== "boolean");
                return (
                  <>
                    {nonBools.map((s) => (
                      <div key={s.key} className="bg-[#0a0806] border border-white/8 rounded-2xl p-5 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <SettingControl
                            setting={s}
                            value={getValue(s.key)}
                            error={errors[s.key]}
                            onChange={(v) => set(s.key, v)}
                          />
                          <button
                            onClick={() => setVersionKey(s.key)}
                            title="Version history"
                            className="shrink-0 mt-1 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/25 hover:text-white/60 transition-colors"
                          >
                            <Clock size={12} />
                          </button>
                        </div>
                        {s.key in unsaved && (
                          <p className="text-[10px] text-[#C9A84C]/70 font-body">Unsaved change</p>
                        )}
                      </div>
                    ))}

                    {bools.length > 0 && (
                      <div className="bg-[#0a0806] border border-white/8 rounded-2xl overflow-hidden">
                        {bools.map((s, i) => (
                          <div key={s.key} className={`px-5 py-4 flex flex-col gap-1 ${i < bools.length - 1 ? "border-b border-white/5" : ""}`}>
                            <div className="flex items-center justify-between gap-4">
                              <SettingControl
                                setting={s}
                                value={getValue(s.key)}
                                error={errors[s.key]}
                                onChange={(v) => set(s.key, v)}
                              />
                              <button onClick={() => setVersionKey(s.key)} title="Version history"
                                className="shrink-0 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/25 hover:text-white/60 transition-colors">
                                <Clock size={12} />
                              </button>
                            </div>
                            {s.key in unsaved && <p className="text-[10px] text-[#C9A84C]/70 font-body">Unsaved change</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {versionKey && (
        <VersionPanel
          settingKey={versionKey}
          onClose={() => setVersionKey(null)}
          onRollback={async (v) => { await rollback(v); setVersionKey(null); }}
        />
      )}
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </div>
  );
}
