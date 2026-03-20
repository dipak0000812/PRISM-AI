"use client";

import { motion, useSpring, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  suffix?: string;
  prefix?: string;
  delay?: number;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  suffix = "",
  prefix = "",
  delay = 0,
}: StatCardProps) {
  const isCritical = label.toLowerCase().includes("critical");
  
  const springValue = useSpring(0, {
    mass: 1,
    stiffness: 70,
    damping: 20,
  });

  const displayValue = useTransform(springValue, (latest) =>
    Math.floor(latest).toLocaleString()
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      springValue.set(value);
    }, delay * 100 + 400);
    return () => clearTimeout(timer);
  }, [value, delay, springValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, backgroundColor: "rgba(39, 39, 42, 0.5)" }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
      }}
      className={`relative flex flex-col gap-6 p-8 glass rounded-4xl border transition-all duration-300 overflow-hidden group cursor-default ${
        isCritical 
          ? "border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.08)] bg-rose-500/5" 
          : "border-zinc-900/80 hover:border-zinc-700/50 hover:shadow-2xl hover:shadow-black/50"
      }`}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border transition-all duration-500 ${
            isCritical ? "bg-rose-500/20 border-rose-500/30 group-hover:scale-110" : "bg-zinc-900 border-zinc-800 group-hover:bg-zinc-800 group-hover:scale-110"
          }`}>
            <Icon className={`w-4 h-4 ${isCritical ? "text-rose-500" : "text-zinc-500 group-hover:text-zinc-300"}`} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-400 transition-colors">
            {label}
          </span>
        </div>
        {trend && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-tight ${
              trend.isUp
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
            }`}
          >
            {trend.isUp ? "+" : "-"}
            {trend.value}%
          </motion.div>
        )}
      </div>

      <div className="flex items-baseline gap-1 relative z-10">
        <span className={`text-6xl font-black tracking-tight tabular-nums ${isCritical ? "text-white" : "text-zinc-100"}`}>
          <motion.span>{displayValue}</motion.span>
          {suffix}
        </span>
      </div>

      {/* Decorative inner glow for critical */}
      {isCritical && (
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-rose-500/10 blur-[60px] rounded-full group-hover:scale-110 transition-transform duration-700" />
      )}
      <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/2 blur-[80px] rounded-full pointer-events-none" />
    </motion.div>
  );
}

