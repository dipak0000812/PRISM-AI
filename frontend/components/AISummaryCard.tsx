"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles, Terminal } from "lucide-react";

interface AISummaryCardProps {
  text: string;
  delay?: number;
}

export function AISummaryCard({ text, delay = 0 }: AISummaryCardProps) {
  const [displayedText, setDisplayedText] = useState("");
  const duration = text.length * 0.02; // Roughly 50 chars per second

  useEffect(() => {
    let currentText = "";
    const controls = animate(0, text.length, {
      duration: duration,
      ease: "linear",
      delay: delay,
      onUpdate: (latest) => {
        const charCount = Math.floor(latest);
        if (charCount > currentText.length) {
          currentText = text.slice(0, charCount);
          setDisplayedText(currentText);
        }
      },
    });

    return () => controls.stop();
  }, [text, duration, delay]);

  return (
    <div className="flex flex-col gap-4 p-8 glass rounded-2xl border border-zinc-900 overflow-hidden group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg group-hover:scale-110 transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Autonomous Intelligence Analysis
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900/50 border border-zinc-800 text-[8px] font-bold text-emerald-400">
          <Terminal className="w-2.5 h-2.5" />
          CLAUDE-3.1-SONNET
        </div>
      </div>

      <div className="relative">
        <div className="text-lg leading-relaxed text-zinc-200 font-medium tracking-tight">
          {displayedText}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-1.5 h-5 bg-white ml-1 align-middle"
          />
        </div>
      </div>

      <div className="w-full flex justify-end">
        <div className="text-[10px] text-zinc-600 font-medium flex items-center gap-2">
          <span>Analysis confidence: 98.4%</span>
          <div className="w-12 h-1 bg-zinc-900 rounded-full overflow-hidden">
             <div className="w-[98.4%] h-full bg-emerald-500/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
