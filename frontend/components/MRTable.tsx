"use client";

import { motion } from "framer-motion";
import { RiskPill, RiskLevel } from "./RiskPill";
import { GitBranch, User, Clock, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface MRData {
  id: string;
  title: string;
  author: string;
  branch: string;
  riskScore: number;
  riskLevel: RiskLevel;
  updatedAt: string;
}

interface MRTableProps {
  data: MRData[];
  previewMode?: boolean;
}

export function MRTable({ data, previewMode = false }: MRTableProps) {
  const router = useRouter();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-rose-500";
    if (score >= 50) return "bg-orange-500";
    if (score >= 25) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <div className={`relative w-full glass rounded-3xl border border-zinc-900 border-collapse overflow-hidden shadow-2xl transition-all duration-700 ${previewMode ? "max-h-[500px]" : ""}`}>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl">
            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              Analysis Payload
            </th>
            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 text-center">
              Severity Node
            </th>
            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 text-right">
              Coefficient
            </th>
            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 text-right">
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900/40">
          {data.map((mr, index) => (
            <motion.tr
              key={mr.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              whileHover={{ 
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                x: 4,
                transition: { duration: 0.15 } 
              }}
              onClick={() => router.push(`/mr/${mr.id}`)}
              className="group cursor-pointer relative"
            >
              {/* Left Indicator Bar */}
              <td className="absolute left-0 top-0 bottom-0 w-1 p-0 overflow-hidden">
                <div className={`h-full w-full ${getScoreColor(mr.riskScore)} opacity-40 group-hover:opacity-100 transition-opacity`} />
              </td>

              <td className="px-10 py-8">
                <div className="flex items-center gap-6">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${getScoreColor(mr.riskScore)} shadow-[0_0_12px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_15px_currentColor] transition-all`} />
                  <div className="flex flex-col gap-2">
                    <span className="text-lg font-black text-white transition-colors tracking-tight leading-none">
                        {mr.title}
                    </span>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-600 group-hover:text-zinc-500 transition-colors uppercase tracking-[0.05em]">
                        <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 opacity-40" strokeWidth={2.5} />
                            {mr.author}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="flex items-center gap-1.5">
                            <GitBranch className="w-3.5 h-3.5 opacity-40" strokeWidth={2.5} />
                            {mr.branch}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="tabular-nums font-black text-zinc-700">#{mr.id.split("-")[1]}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-10 py-8 text-center">
                <div className="flex justify-center scale-110">
                    <RiskPill level={mr.riskLevel} />
                </div>
              </td>
              <td className="px-10 py-8 text-right">
                <div className="flex flex-col items-end gap-1">
                    <span className="text-base font-black tabular-nums text-white transition-colors">
                        {mr.riskScore}
                    </span>
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                        FACTOR
                    </span>
                </div>
              </td>
              <td className="px-10 py-8 text-right">
                <div className="flex items-center justify-end gap-4 text-[11px] font-black text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase tracking-widest">
                  <Clock className="w-4 h-4 opacity-40" />
                  {mr.updatedAt}
                  <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-2 transition-all text-zinc-800 group-hover:text-zinc-400" />
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {previewMode && (
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black to-transparent pointer-events-none z-10" />
      )}
    </div>
  );
}

