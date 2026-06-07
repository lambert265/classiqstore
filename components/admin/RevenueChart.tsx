"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { month: string; revenue: number }[];
}

const fmt = (n: number) => `₦${(n / 1000).toFixed(0)}k`;

export default function RevenueChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} 
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }} 
          tickLine={false} 
        />
        <YAxis 
          tickFormatter={fmt} 
          tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} 
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }} 
          tickLine={false} 
          width={48} 
        />
        <Tooltip
          formatter={(v) => [`₦${Number(v).toLocaleString("en-NG")}`, "Revenue"]}
          contentStyle={{ 
            background: "#0a1a10", 
            border: "1px solid rgba(74,222,128,0.2)", 
            borderRadius: 12, 
            fontSize: 12,
            color: "#fff"
          }}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#4ade80" 
          strokeWidth={2.5} 
          fill="url(#revenueGrad)" 
          dot={false} 
          activeDot={{ r: 5, fill: "#4ade80", stroke: "#0d1f16", strokeWidth: 2 }} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
