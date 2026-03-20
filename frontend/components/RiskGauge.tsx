"use client";

import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number;
}

export function RiskGauge({ score }: RiskGaugeProps) {
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcExtent = 0.75; // 270 degrees
  const arcLength = circumference * arcExtent;
  // Offset math: at 0 score, offset is arcLength (whole arc hidden). At 100, offset is 0.
  const arcOffset = arcLength - (score / 100) * arcLength;

  const getScoreColor = (s: number) => {
    if (s >= 80) return "#f43f5e"; // rose-500
    if (s >= 50) return "#f97316"; // orange-500
    if (s >= 25) return "#eab308"; // yellow-500
    return "#10b981"; // emerald-500
  };

  const color = getScoreColor(score);

  return (
    <div className="relative flex flex-col items-center justify-center p-8 glass rounded-2xl border border-zinc-900 overflow-hidden">
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Risk Score</span>
      </div>

      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform rotate-135" // Start from bottom center
      >
        {/* Background track */}
        <circle
          stroke="rgba(39, 39, 42, 0.4)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          style={{ strokeDashoffset: 0 }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress track */}
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: arcOffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>

      <div className="absolute flex flex-col items-center justify-center pt-4">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-5xl font-black tracking-tighter text-white tabular-nums drop-shadow-md"
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 -mt-2">
          OF 100
        </span>
      </div>

      {/* Grid pattern background refinement */}
      <div className="absolute inset-0 -z-10 opacity-5 pointer-events-none">
        <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [size:24px_24px]" />
      </div>
    </div>
  );
}
