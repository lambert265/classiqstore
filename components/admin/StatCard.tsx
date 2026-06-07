import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: number;
  href?: string;
}

export default function StatCard({ label, value, subtext, icon: Icon, iconColor = "bg-blue-100 text-blue-600", trend, href }: StatCardProps) {
  const Wrap = href ? Link : "div";
  return (
    <Wrap
      href={href as string}
      className={`bg-white rounded-2xl border border-blue-500/10 p-5 flex flex-col gap-4 shadow-sm transition-all duration-200 ${href ? "hover:-translate-y-1 hover:shadow-md hover:shadow-blue-500/10 cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon size={18} strokeWidth={1.8} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? "bg-emerald-50 text-emerald-600" : trend < 0 ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-500"}`}>
            {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-0.5">{label}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
    </Wrap>
  );
}
