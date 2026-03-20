"use client";

import { motion } from "framer-motion";
import { Shield, Activity, GitMerge, AlertCircle, TrendingUp, ChevronRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MRTable } from "@/components/MRTable";
import { MOCK_MRS } from "@/lib/mock-data";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Header section */}
      <div className="flex flex-col gap-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
            System Operational
          </span>
        </motion.div>
        
        <div className="flex items-end justify-between border-b border-zinc-900/50 pb-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black tracking-tighter text-white"
          >
            Risk Overview
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[11px] font-bold text-zinc-600 mb-2 uppercase tracking-widest italic"
          >
            Last update: Today at 2:45 PM
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          label="Active Analyses"
          value={14}
          icon={Activity}
          trend={{ value: 12, isUp: true }}
          delay={1}
        />
        <StatCard
          label="Critical Risks"
          value={3}
          icon={AlertCircle}
          delay={2}
        />
        <StatCard
          label="Total MRs Filtered"
          value={1283}
          icon={GitMerge}
          trend={{ value: 4, isUp: true }}
          delay={3}
        />
        <StatCard
          label="Avg Impact Score"
          value={41}
          icon={TrendingUp}
          suffix="%"
          delay={4}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-8 mt-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Recent Intelligence Reports</h2>
          <p className="text-xs text-zinc-500 font-medium tracking-tight">Monitoring security events across 4 high-value repository nodes.</p>
        </div>
        <div className="flex flex-col gap-10">
            <div className="relative group/table transition-all duration-500 hover:scale-[1.005]">
                <div className="absolute -inset-1 bg-linear-to-b from-indigo-500/5 to-transparent blur-2xl -z-10 opacity-50" />
                <MRTable data={MOCK_MRS.slice(0, 3)} previewMode={true} />
            </div>
            
            <div className="flex flex-col items-center gap-6 -mt-2 relative z-20">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                    Showing 3 of {MOCK_MRS.length} active merge requests
                </span>
                <button 
                  onClick={() => window.location.href = "/mr"}
                  className="flex items-center gap-2.5 px-8 py-4 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-900 hover:border-zinc-700/50 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-200 transition-all shadow-xl backdrop-blur-md active:scale-95 group"
                >
                    View all merge requests
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
      </div>

      {/* Background Layering */}
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <div className="absolute top-[20%] left-[-5%] w-[40%] h-[40%] bg-indigo-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-zinc-800/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

