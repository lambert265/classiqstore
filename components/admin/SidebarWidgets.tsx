import Link from "next/link";
import { Plus, Zap, Mail, Download } from "lucide-react";

export interface AudienceData {
  repeatPct: number;
  avgOrderValue: number;
  abandonPct: number;
}

export function AudienceMetrics({ data }: { data: AudienceData }) {
  const metrics = [
    { label: "Repeat Customers", value: `${data.repeatPct}%`,                          sub: "of total buyers"     },
    { label: "Avg Order Value",  value: `₦${data.avgOrderValue.toLocaleString()}`,      sub: "per transaction"     },
    { label: "Cart Abandonment", value: `${data.abandonPct}%`,                          sub: "left without buying" },
  ];

  return (
    <div>
      <p className="text-[9px] tracking-[0.25em] uppercase text-white/20 font-body mb-3">Audience</p>
      <div className="flex flex-col gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white/[0.03] border border-white/6 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-body text-[10px] text-white/35 truncate">{m.label}</p>
              <p className="font-body text-[9px] text-white/20 truncate">{m.sub}</p>
            </div>
            <p className="font-heading text-base font-bold text-white shrink-0">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const ACTIONS = [
  { label: "Add Product",     icon: Plus,     href: "/admin/products/new",  color: "hover:border-emerald-400/40 hover:text-emerald-300" },
  { label: "Run Flash Sale",  icon: Zap,      href: "/admin/products/flash-sale", color: "hover:border-amber-400/40 hover:text-amber-300"     },
  { label: "Email Customers", icon: Mail,     href: "/admin/subscribers",   color: "hover:border-blue-400/40 hover:text-blue-300"       },
  { label: "Export Reports",  icon: Download, href: "/admin/orders",        color: "hover:border-purple-400/40 hover:text-purple-300"   },
];

export function QuickActions() {
  return (
    <div>
      <p className="text-[9px] tracking-[0.25em] uppercase text-white/20 font-body mb-3">Quick Actions</p>
      <div className="flex flex-col gap-1.5">
        {ACTIONS.map(({ label, icon: Icon, href, color }) => (
          <Link key={label} href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/8 text-white/35 font-body text-xs btn-3d transition-colors duration-150 ${color}`}>
            <Icon size={13} strokeWidth={1.5} />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
