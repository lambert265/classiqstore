import Link from "next/link";
import { CheckCircle, Calendar, RefreshCw } from "lucide-react";

interface Props {
  confirmationRate: number;
  cancellationRate: number;
  bestDay: { day: string; orders: number; revenue: number } | null;
  returnRate: number;
  returnCustomers: number;
  totalCustomers: number;
}

export default function StoreMetrics({
  confirmationRate, cancellationRate, bestDay,
  returnRate, returnCustomers, totalCustomers,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 chart-card">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle size={13} className="text-emerald-400" />
          </div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 font-body">Confirmation Rate</p>
        </div>
        <p className="font-heading text-4xl font-bold text-white mb-1"
          style={{ textShadow: confirmationRate >= 70 ? "0 0 20px rgba(74,222,128,0.3)" : "0 0 20px rgba(239,68,68,0.3)" }}>
          {confirmationRate}%
        </p>
        <p className="font-body text-xs text-white/40 mb-3">of orders get confirmed</p>
        <div className="h-1.5 bg-white/6 rounded-full overflow-hidden flex gap-0.5">
          <div className="h-full bg-emerald-400 rounded-full transition-all"
            style={{ width: `${confirmationRate}%` }} />
          <div className="h-full bg-red-400 rounded-full transition-all"
            style={{ width: `${cancellationRate}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-body text-[9px] text-emerald-400">{confirmationRate}% confirmed</span>
          <span className="font-body text-[9px] text-red-400">{cancellationRate}% cancelled</span>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 chart-card">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Calendar size={13} className="text-amber-400" />
          </div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 font-body">Best Selling Day</p>
        </div>
        {bestDay ? (
          <>
            <p className="font-heading text-4xl font-bold text-white mb-1"
              style={{ textShadow: "0 0 20px rgba(245,158,11,0.3)" }}>
              {bestDay.day}
            </p>
            <p className="font-body text-xs text-white/40 mb-1">{bestDay.orders} orders on average</p>
            <p className="font-body text-xs text-amber-400 font-semibold">₦{bestDay.revenue.toLocaleString()} avg revenue</p>
          </>
        ) : (
          <p className="font-body text-sm text-white/25 mt-2">Not enough data yet</p>
        )}
        <Link href="/admin/analytics" className="font-body text-[10px] text-white/25 hover:text-white transition-colors mt-3 block">
          View full analytics →
        </Link>
      </div>

      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 chart-card">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <RefreshCw size={13} className="text-purple-400" />
          </div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 font-body">Return Rate</p>
        </div>
        <p className="font-heading text-4xl font-bold text-white mb-1"
          style={{ textShadow: "0 0 20px rgba(168,85,247,0.3)" }}>
          {returnRate}%
        </p>
        <p className="font-body text-xs text-white/40 mb-3">customers ordered more than once</p>
        <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{
              width: `${returnRate}%`,
              background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
              boxShadow: "0 0 8px rgba(167,139,250,0.4)",
            }} />
        </div>
        <p className="font-body text-[10px] text-white/25 mt-2">
          {returnCustomers} of {totalCustomers} customers returned
        </p>
      </div>

    </div>
  );
}
