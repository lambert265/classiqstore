"use client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  ReferenceLine, Label, LineChart, Line
} from "recharts";

const TT_STYLE = {
  backgroundColor: "rgba(10,26,16,0.92)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "rgba(240,250,244,0.9)",
  fontFamily: "var(--font-dmsans)",
};

export function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  const hasData = data.some(d => d.revenue > 0);
  const chartData = hasData ? data : data.map(d => ({ ...d, revenue: 0, ghost: 1000 }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity={hasData ? 0.35 : 0.08} />
            <stop offset="100%" stopColor="#4ade80" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "var(--font-dmsans)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "var(--font-dmsans)" }} axisLine={false} tickLine={false}
          tickFormatter={v => hasData ? `₦${(v/1000).toFixed(0)}k` : "₦0"} width={48} />
        <Tooltip contentStyle={TT_STYLE} formatter={(v) => [`₦${Number(v).toLocaleString()}`, "Revenue"]} />
        {hasData ? (
          <Area type="monotone" dataKey="revenue" stroke="#4ade80" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: "#4ade80", strokeWidth: 0 }} />
        ) : (
          <Area type="monotone" dataKey="ghost" stroke="rgba(74,222,128,0.15)" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#revGrad)" dot={false} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function WeeklySalesChart({ data }: { data: { day: string; sales: number }[] }) {
  const hasData = data.some(d => d.sales > 0);
  const maxVal = hasData ? Math.max(...data.map(d => d.sales)) : 1;
  const GHOST_HEIGHTS = [6000, 9000, 5000, 12000, 8000, 15000, 10000];
  const chartData = hasData ? data : data.map((d, i) => ({ ...d, sales: GHOST_HEIGHTS[i] }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 8, right: 4, left: -15, bottom: 0 }} barCategoryGap="30%">
        <defs>
          <linearGradient id="amberGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
            <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
          </linearGradient>
          <linearGradient id="ghostBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" stopOpacity={1} />
            <stop offset="100%" stopColor="rgba(255,255,255,0.03)" stopOpacity={1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} horizontal={false} />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        <XAxis dataKey="day" axisLine={false} tickLine={false}
          tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "var(--font-dmsans)" }} />
        <YAxis axisLine={false} tickLine={false}
          tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "var(--font-dmsans)" }}
          tickFormatter={(v: number) => hasData ? `₦${(v / 1000).toFixed(0)}k` : ""} />
        <Bar dataKey="sales" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {chartData.map((entry, i) => (
            <Cell key={i}
              fill={!hasData ? "url(#ghostBar)" : entry.sales === maxVal ? "url(#amberGold)" : "rgba(245,158,11,0.35)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export interface CategoryStat { name: string; value: number; }

export function ForexChart({ data }: { data: { label: string; revenue: number; orders: number }[] }) {
  const hasData = data.some(d => d.revenue > 0);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a8891e" />
            <stop offset="100%" stopColor="#C9A84C" />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "var(--font-dmsans)" }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="rev" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "var(--font-dmsans)" }} axisLine={false} tickLine={false}
          tickFormatter={v => hasData ? `₦${(v / 1000).toFixed(0)}k` : "₦0"} width={52} />
        <YAxis yAxisId="ord" orientation="right" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "var(--font-dmsans)" }} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={TT_STYLE}
          formatter={(v, name) => name === "revenue" ? [`₦${Number(v).toLocaleString()}`, "Revenue"] : [v, "Orders"]} />
        <Line yAxisId="rev" type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#C9A84C", strokeWidth: 0 }} />
        <Line yAxisId="ord" type="monotone" dataKey="orders" stroke="#C4622D" strokeWidth={1.5} dot={false} strokeDasharray="4 3" activeDot={{ r: 4, fill: "#C4622D", strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export interface CategoryStat { name: string; value: number; }

const CATEGORY_COLORS: Record<string, string> = {
  beanie:    "#e8c99a",
  skirt:     "#c9622a",
  set:       "#4a7aac",
  bag:       "#5a8c6a",
  accessory: "#9b6fa8",
  shorts:    "#c9a84c",
  baby_wear: "#6a8cb0",
};

const CATEGORY_LABELS: Record<string, string> = {
  beanie:    "Beanies",
  skirt:     "Skirts",
  set:       "Sets",
  bag:       "Bags",
  accessory: "Accessories",
  shorts:    "Shorts",
  baby_wear: "Baby Wear",
};

export function CategoryDonut({ data }: { data: CategoryStat[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (!data.length || total === 0) {
    return (
      <div className="flex flex-col gap-5">
        <div className="mx-auto" style={{ width: 180, height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={[{ value: 1 }]} cx="50%" cy="50%"
                innerRadius={56} outerRadius={80} dataKey="value" strokeWidth={0}>
                <Cell fill="rgba(255,255,255,0.06)" />
                <Label content={({ viewBox }: any) => {
                  const { cx, cy } = viewBox;
                  return (
                    <g>
                      <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle"
                        style={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "var(--font-dmsans)", letterSpacing: "0.12em" }}>
                        NO DATA
                      </text>
                      <text x={cx} y={cy + 11} textAnchor="middle" dominantBaseline="middle"
                        style={{ fill: "rgba(255,255,255,0.15)", fontSize: 22, fontWeight: 700, fontFamily: "var(--font-playfair)" }}>
                        0%
                      </text>
                    </g>
                  );
                }} position="center" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-xs text-white/25 font-body -mt-2">No products added yet</p>
      </div>
    );
  }

  const withPct = data
    .map(d => ({ ...d, label: CATEGORY_LABELS[d.name] ?? d.name, pct: Math.round((d.value / total) * 100) }))
    .filter(d => d.pct > 0);

  const top = withPct.length ? withPct.reduce((a, b) => (a.pct > b.pct ? a : b)) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="mx-auto" style={{ width: 180, height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={withPct} cx="50%" cy="50%"
              innerRadius={56} outerRadius={80} paddingAngle={3}
              dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270}>
              {withPct.map((entry) => (
                <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? "#6b7280"} />
              ))}
              {top && (
                <Label content={({ viewBox }: any) => {
                  const { cx, cy } = viewBox;
                  return (
                    <g>
                      <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle"
                        style={{ fill: "rgba(255,255,255,0.55)", fontSize: 9, fontFamily: "var(--font-dmsans)", letterSpacing: "0.12em" }}>
                        {top.label.toUpperCase()}
                      </text>
                      <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle"
                        style={{ fill: "#ffffff", fontSize: 24, fontWeight: 700, fontFamily: "var(--font-playfair)" }}>
                        {top.pct}%
                      </text>
                    </g>
                  );
                }} position="center" />
              )}
            </Pie>
            <Tooltip contentStyle={TT_STYLE}
              formatter={(v, name) => [`${Math.round((Number(v) / total) * 100)}%`, CATEGORY_LABELS[String(name)] ?? String(name)]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
        {withPct.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: CATEGORY_COLORS[entry.name] ?? "#6b7280" }} />
            <span className="font-body text-[11px] text-white/75 truncate flex-1">{entry.label}</span>
            <span className="font-body text-[11px] font-bold text-white shrink-0">{entry.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
