"use client";

import { motion } from "framer-motion";

export type RiskLevel = "critical" | "high" | "medium" | "low";

interface RiskPillProps {
  level: RiskLevel;
}

const RISK_CONFIG = {
  critical: {
    label: "Critical",
    bgColor: "bg-rose-500/10",
    textColor: "text-rose-500",
    borderColor: "border-rose-500/20",
    glowColor: "rgba(244, 63, 94, 0.4)",
  },
  high: {
    label: "High",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-500",
    borderColor: "border-orange-500/20",
    glowColor: "rgba(249, 115, 22, 0.4)",
  },
  medium: {
    label: "Medium",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-500",
    borderColor: "border-yellow-500/20",
    glowColor: "rgba(234, 179, 8, 0.4)",
  },
  low: {
    label: "Low",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-500",
    borderColor: "border-emerald-500/20",
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
};

export function RiskPill({ level }: RiskPillProps) {
  const config = RISK_CONFIG[level as RiskLevel] ?? RISK_CONFIG["low"];


  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} text-[10px] font-bold uppercase tracking-wider overflow-hidden group`}
    >
      <div
        className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity"
        style={{ boxShadow: `inset 0 0 8px ${config.glowColor}` }}
      />
      <div className={`w-1 h-1 rounded-full ${config.textColor.replace("text-", "bg-")} animate-pulse`} />
      <span className="relative z-10">{config.label}</span>
      <motion.div
        className="absolute -inset-1 z-0 pointer-events-none"
        animate={{
          background: [
            `radial-gradient(circle at 20% 50%, ${config.glowColor.replace("1)", "0.2)")} 0%, transparent 50%)`,
            `radial-gradient(circle at 80% 50%, ${config.glowColor.replace("1)", "0.2)")} 0%, transparent 50%)`,
            `radial-gradient(circle at 20% 50%, ${config.glowColor.replace("1)", "0.2)")} 0%, transparent 50%)`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}
