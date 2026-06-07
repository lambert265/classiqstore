"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = [
  "#4ade80", "#22c55e", "#2D6A4F", "#1B4332", 
  "#6ee7b7", "#34d399", "#10b981"
];

interface Props {
  data: { name: string; value: number }[];
}

export default function CategoryDonut({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie 
          data={data} 
          cx="50%" 
          cy="50%" 
          innerRadius={55} 
          outerRadius={85} 
          paddingAngle={3} 
          dataKey="value"
        >
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip
          formatter={(v, name) => [Number(v), String(name)]}
          contentStyle={{ 
            background: "#0a1a10", 
            border: "1px solid rgba(74,222,128,0.2)", 
            borderRadius: 10, 
            fontSize: 12,
            color: "#fff"
          }}
        />
        <Legend 
          iconType="circle" 
          iconSize={8} 
          formatter={(v) => <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{v}</span>} 
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
