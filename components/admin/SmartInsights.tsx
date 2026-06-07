"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, AlertTriangle, TrendingUp, Lightbulb, RefreshCw, ArrowRight } from "lucide-react";

interface Insight {
  type: "alert" | "opportunity" | "content";
  title: string;
  body: string;
  action: string;
  actionHref: string;
  urgent: boolean;
}

const TYPE_CONFIG = {
  alert:       { icon: AlertTriangle, color: "text-amber-400",  bg: "bg-amber-500/10  border-amber-500/20",  dot: "bg-amber-400"  },
  opportunity: { icon: TrendingUp,    color: "text-[#4ade80]",  bg: "bg-[#4ade80]/10  border-[#4ade80]/20",  dot: "bg-[#4ade80]"  },
  content:     { icon: Lightbulb,     color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", dot: "bg-purple-400" },
};

export default function SmartInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading]   = useState(true);
  const [generatedAt, setGeneratedAt] = useState("");
  const [refreshing, setRefreshing]   = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res  = await fetch("/api/smart-insights");
      const data = await res.json();
      setInsights(data.insights ?? []);
      setGeneratedAt(data.generatedAt ? new Date(data.generatedAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : "");
    } catch {
      setInsights([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#4ade80]/15 border border-[#4ade80]/25 flex items-center justify-center">
            <Sparkles size={12} className="text-[#4ade80]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white font-body leading-none">Knotté AI · Smart Insights</p>
            {generatedAt && <p className="text-[10px] text-white/25 font-body mt-0.5">Generated at {generatedAt}</p>}
          </div>
        </div>
        <button onClick={() => load(true)} disabled={refreshing || loading}
          className="flex items-center gap-1.5 text-[10px] font-body text-white/25 hover:text-white/60 transition-colors disabled:opacity-40">
          <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-28 rounded-xl bg-white/4 border border-white/6 animate-pulse" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <p className="text-sm text-white/25 font-body text-center py-6">No insights available right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {insights.map((ins, i) => {
            const cfg  = TYPE_CONFIG[ins.type] ?? TYPE_CONFIG.opportunity;
            const Icon = cfg.icon;
            return (
              <div key={i} className={`relative border rounded-xl p-4 flex flex-col gap-2.5 ${cfg.bg}`}>
                {ins.urgent && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
                <div className="flex items-center gap-2">
                  <Icon size={13} className={cfg.color} />
                  <p className={`text-[10px] tracking-widest uppercase font-body font-semibold ${cfg.color}`}>
                    {ins.type}
                  </p>
                </div>
                <p className="text-sm font-semibold text-white font-body leading-snug">{ins.title}</p>
                <p className="text-xs text-white/50 font-body leading-relaxed flex-1">{ins.body}</p>
                <Link href={ins.actionHref}
                  className="flex items-center gap-1 text-[11px] font-body text-white/40 hover:text-white transition-colors mt-auto group">
                  <span>{ins.action}</span>
                  <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
