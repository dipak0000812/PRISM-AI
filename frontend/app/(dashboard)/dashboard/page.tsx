"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Shield, Activity, GitMerge, AlertCircle, TrendingUp, ChevronRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MRTable } from "@/components/MRTable";
import { getAnalyses } from "@/lib/api";

function SkeletonStat() {
  return (
    <div className="animate-pulse p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl flex items-center gap-5">
      <div className="w-11 h-11 rounded-2xl bg-zinc-800" />
      <div className="flex flex-col gap-2">
        <div className="h-2 w-20 bg-zinc-800 rounded" />
        <div className="h-6 w-12 bg-zinc-700 rounded" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["analyses"],
    queryFn: getAnalyses,
    refetchInterval: 10000,
  });

  const totalMRs = analyses.length;
  const criticalCount = analyses.filter((a) => a.risk_level === "critical").length;
  const avgScore = totalMRs
    ? Math.round(analyses.reduce((s, a) => s + a.risk_score, 0) / totalMRs)
    : 0;
  const avgBlast =
    totalMRs
      ? (analyses.reduce((s, a) => s + (a.blast_radius_size ?? 0), 0) / totalMRs).toFixed(1)
      : "0.0";

  const lastUpdated = analyses[0]
    ? new Date(analyses[0].created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">System Operational</span>
        </motion.div>
        <div className="flex items-end justify-between border-b border-zinc-900/50 pb-6">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-black tracking-tighter text-white">
            Risk Overview
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-[11px] font-bold text-zinc-600 mb-2 uppercase tracking-widest italic">
            {isLoading ? "Loading..." : `Last update: ${lastUpdated}`}
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard label="Active Analyses" value={totalMRs} icon={Activity} trend={{ value: 0, isUp: true }} delay={1} />
          <StatCard label="Critical Risks" value={criticalCount} icon={AlertCircle} delay={2} />
          <StatCard label="Total MRs Processed" value={totalMRs} icon={GitMerge} trend={{ value: 0, isUp: true }} delay={3} />
          <StatCard label="Avg Risk Score" value={avgScore} icon={TrendingUp} suffix="%" delay={4} />
        </div>
      )}

      {/* Avg blast radius badge */}
      {!isLoading && totalMRs > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/40 border border-zinc-900 rounded-2xl self-start">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
            Avg blast radius: <span className="text-white">{avgBlast} nodes</span>
          </span>
        </div>
      )}

      {/* MR Table */}
      <div className="flex flex-col gap-8 mt-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Recent Intelligence Reports</h2>
          <p className="text-xs text-zinc-500 font-medium tracking-tight">
            Monitoring {totalMRs} merge request{totalMRs !== 1 ? "s" : ""} across connected repositories.
          </p>
        </div>
        <div className="flex flex-col gap-10">
          <div className="relative group/table transition-all duration-500 hover:scale-[1.005]">
            <div className="absolute -inset-1 bg-linear-to-b from-indigo-500/5 to-transparent blur-2xl -z-10 opacity-50" />
            {isLoading ? (
              <div className="animate-pulse glass rounded-3xl border border-zinc-900 h-40" />
            ) : analyses.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16 text-zinc-600 glass rounded-3xl border border-zinc-900">
                <GitMerge className="w-8 h-8 opacity-30" />
                <p className="text-sm font-medium">No analyses yet. Open a GitLab MR to see results here.</p>
              </div>
            ) : (
              <MRTable data={analyses.slice(0, 3)} previewMode={true} />
            )}
          </div>
          <div className="flex flex-col items-center gap-6 -mt-2 relative z-20">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
              Showing {Math.min(3, analyses.length)} of {analyses.length} active merge requests
            </span>
            <button
              onClick={() => (window.location.href = "/mr")}
              className="flex items-center gap-2.5 px-8 py-4 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-900 hover:border-zinc-700/50 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-200 transition-all shadow-xl backdrop-blur-md active:scale-95 group"
            >
              View all merge requests
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <div className="absolute top-[20%] left-[-5%] w-[40%] h-[40%] bg-indigo-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-zinc-800/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
