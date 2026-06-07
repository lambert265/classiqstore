"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCountUp } from "@/hooks/useCountUp";
import {
  TrendingUp, ShoppingBag, Users, Package, Scissors, Mail, LucideIcon, AlertTriangle, ArrowRight,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp, ShoppingBag, Users, Package, Scissors, Mail,
};

export function LastUpdated() {
  const [ts, setTs] = useState("");

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setTs(fmt());
    const id = setInterval(() => setTs(fmt()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!ts) return null;
  return <p className="font-body text-[10px] text-white/20 mt-1">Last updated · {ts}</p>;
}

export interface StatDef {
  label: string;
  numericValue: number;
  rawValue?: string;
  sub: string;
  iconKey: string;
  href: string;
  color: string;
  bg: string;
  trend?: number;
}

function StatCard({ label, numericValue, rawValue, sub, iconKey, href, color, bg, trend, delay }: StatDef & { delay: number }) {
  const counted = useCountUp(numericValue);
  const display = rawValue ? `₦${counted.toLocaleString()}` : counted.toLocaleString();
  const Icon = ICON_MAP[iconKey] ?? TrendingUp;

  return (
    <Link href={href}
      className={`border ${bg} rounded-2xl p-4 btn-3d card-hover block`}
      style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={15} className={color} />
        </div>
        {trend !== undefined && (
          <span className={`text-[9px] font-body font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
            trend >= 0
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/15 text-red-400 border border-red-500/20"
          }`}>
            {trend >= 0 ? "↑" : "↓"}{Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold font-heading ${color}`}>{display}</p>
      <p className="text-xs text-white/60 font-body font-medium mt-0.5">{label}</p>
      <p className="text-[10px] text-white/25 font-body mt-0.5">{sub}</p>
    </Link>
  );
}

export function StatsGrid({ stats }: { stats: StatDef[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((s, i) => (
        <StatCard key={s.label} {...s} delay={i * 80} />
      ))}
    </div>
  );
}

export interface PendingAction {
  label: string;
  count: number;
  href: string;
  color: string;
}

export function PendingActionsBanner({ actions }: { actions: PendingAction[] }) {
  const urgent = actions.filter(a => a.count > 0);
  if (!urgent.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {urgent.map(a => (
        <Link key={a.href} href={a.href}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-body font-medium transition-all hover:scale-[1.02] ${a.color}`}>
          <AlertTriangle size={11} />
          <span>{a.count} {a.label}</span>
          <ArrowRight size={10} className="opacity-60" />
        </Link>
      ))}
    </div>
  );
}

export interface StockHealth {
  total: number;
  healthy: number;
  low: number;
  out: number;
}

export function StockHealthBar({ stock }: { stock: StockHealth }) {
  const { total, healthy, low, out } = stock;
  if (total === 0) return null;
  const healthyPct = Math.round((healthy / total) * 100);
  const lowPct     = Math.round((low     / total) * 100);
  const outPct     = Math.round((out     / total) * 100);

  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[9px] tracking-[0.25em] uppercase text-white/25 font-body">Inventory Health</p>
          <p className="text-sm font-semibold text-white font-body mt-0.5">{total} products total</p>
        </div>
        <Link href="/admin/products" className="text-[10px] font-body text-white/30 hover:text-white transition-colors">Manage →</Link>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        {healthyPct > 0 && <div className="bg-[#4ade80] rounded-full transition-all" style={{ width: `${healthyPct}%` }} />}
        {lowPct     > 0 && <div className="bg-amber-400 rounded-full transition-all" style={{ width: `${lowPct}%` }} />}
        {outPct     > 0 && <div className="bg-red-500 rounded-full transition-all"   style={{ width: `${outPct}%` }} />}
      </div>
      <div className="flex items-center gap-4 mt-2.5">
        {[
          { label: "Healthy", count: healthy, color: "bg-[#4ade80]", text: "text-[#4ade80]" },
          { label: "Low stock", count: low,   color: "bg-amber-400", text: "text-amber-400" },
          { label: "Out of stock", count: out, color: "bg-red-500",  text: "text-red-400"  },
        ].map(({ label, count, color, text }) => count > 0 && (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
            <span className={`font-body text-[10px] ${text}`}>{count} {label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RevenueGoal({ current, goal }: { current: number; goal: number }) {
  const pct     = Math.min(Math.round((current / goal) * 100), 100);
  const remaining = Math.max(goal - current, 0);
  const over    = current > goal;

  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[9px] tracking-[0.25em] uppercase text-white/25 font-body">Monthly Revenue Goal</p>
        <span className={`text-[10px] font-body font-bold px-2 py-0.5 rounded-full ${
          over ? "bg-[#4ade80]/15 text-[#4ade80]" : pct >= 75 ? "bg-amber-500/15 text-amber-400" : "bg-white/8 text-white/40"
        }`}>{pct}%</span>
      </div>
      <div className="flex items-end justify-between mb-2">
        <p className="font-heading text-xl font-bold text-white">₦{current.toLocaleString()}</p>
        <p className="font-body text-xs text-white/30">of ₦{goal.toLocaleString()}</p>
      </div>
      <div className="h-2 bg-white/6 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: over ? "linear-gradient(90deg,#22c55e,#4ade80)" : pct >= 75 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#60a5fa,#93c5fd)",
            boxShadow: over ? "0 0 8px rgba(74,222,128,0.5)" : "",
          }} />
      </div>
      <p className="font-body text-[10px] text-white/30 mt-2">
        {over ? `🎉 Goal smashed by ₦${(current - goal).toLocaleString()}!` : `₦${remaining.toLocaleString()} to go`}
      </p>
    </div>
  );
}
