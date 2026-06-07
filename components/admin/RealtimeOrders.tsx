"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell } from "lucide-react";

export default function RealtimeOrders({ initialCount }: { initialCount: number }) {
  const [count, setCount]   = useState(initialCount);
  const [newOrders, setNew] = useState(0);
  const [flash, setFlash]   = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "orders",
      }, () => {
        setCount(c => c + 1);
        setNew(n => n + 1);
        setFlash(true);
        setTimeout(() => setFlash(false), 3000);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className={`flex items-center gap-2 transition-all duration-500 ${flash ? "scale-105" : ""}`}>
      <div className="relative">
        <Bell size={16} className={`transition-colors ${newOrders > 0 ? "text-[#4ade80]" : "text-white/30"}`} />
        {newOrders > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#4ade80] text-[#0d1f16] text-[8px] font-bold flex items-center justify-center animate-bounce">
            {newOrders}
          </span>
        )}
      </div>
      <span className="font-heading text-2xl font-bold text-white">{count.toLocaleString()}</span>
      {newOrders > 0 && (
        <span className="font-body text-[10px] text-[#4ade80] animate-pulse">
          +{newOrders} new
        </span>
      )}
    </div>
  );
}
