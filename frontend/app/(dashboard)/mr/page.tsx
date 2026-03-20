"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitMerge, Filter, Search, ChevronDown, Check, Activity, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import { MRTable } from "@/components/MRTable";
import { MOCK_MRS } from "@/lib/mock-data";

export default function MergeRequestsPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);

  const risks = [
    { label: "Critical", color: "text-rose-500", bg: "bg-rose-500" },
    { label: "High", color: "text-orange-500", bg: "bg-orange-500" },
    { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-500" },
    { label: "Low", color: "text-emerald-500", bg: "bg-emerald-500" }
  ];

  const highRiskCount = MOCK_MRS.filter(mr => mr.riskScore >= 70).length;
  const avgRiskScore = Math.round(MOCK_MRS.reduce((acc, mr) => acc + mr.riskScore, 0) / MOCK_MRS.length);

  return (
    <div className="flex flex-col gap-12 pb-20 max-w-7xl mx-auto w-full">
      {/* Header section - Matching Dashboard Style */}
      <div className="flex flex-col gap-3">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="flex items-center gap-2.5"
         >
           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
             PRISM Intelligence
           </span>
         </motion.div>
         
         <div className="flex items-end justify-between border-b border-zinc-900/50 pb-8">
           <div className="flex flex-col gap-1.5">
             <motion.h1
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-5xl font-black tracking-tighter text-white"
             >
               Merge Requests
             </motion.h1>
             <p className="text-sm text-zinc-500 font-medium tracking-tight">
               Real-time forensic analysis of incoming code modifications and transitive dependency risks.
             </p>
           </div>
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="text-[11px] font-bold text-zinc-600 mb-2 uppercase tracking-widest italic"
           >
             Live Analysis Node: active
           </motion.div>
         </div>
      </div>

      {/* Summary Stat Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl flex items-center gap-5 group hover:border-zinc-800 transition-colors">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
                  <Activity className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Total MRs</span>
                  <span className="text-2xl font-black text-white">{MOCK_MRS.length}</span>
              </div>
          </div>
          <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl flex items-center gap-5 group hover:border-zinc-800 transition-colors">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl group-hover:bg-rose-500/10 group-hover:border-rose-500/20 transition-all">
                  <AlertTriangle className="w-5 h-5 text-zinc-400 group-hover:text-rose-500" />
              </div>
              <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">High Risk Nodes</span>
                  <span className="text-2xl font-black text-white">{highRiskCount}</span>
              </div>
          </div>
          <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl flex items-center gap-5 group hover:border-zinc-800 transition-colors">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
                  <TrendingUp className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Mean Analysis Score</span>
                  <span className="text-2xl font-black text-white">{avgRiskScore}<span className="text-sm font-bold text-zinc-600 ml-1">/ 100</span></span>
              </div>
          </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Repository Feed</h3>
                <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest italic">
                    <span className="text-rose-500">{highRiskCount} high-risk</span> merge requests require immediate attention
                </p>
            </div>
            
            <div className="flex items-center gap-4 bg-zinc-950/40 p-2 border border-zinc-900 rounded-[24px]">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                        type="text" 
                        placeholder="Search by ID or branch..." 
                        className="pl-11 pr-5 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-[11px] font-bold text-white focus:outline-none focus:border-zinc-600 transition-all w-[320px] placeholder:text-zinc-700 hover:bg-zinc-800/50"
                    />
                </div>
                
                {/* Risk Level Filter Dropdown */}
                <div className="relative">
                    <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-3 px-6 py-3.5 border rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        isFilterOpen || selectedRisk 
                        ? "bg-zinc-800 border-zinc-700 text-white shadow-lg" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700"
                    }`}
                    >
                    <Filter className={`w-4 h-4 ${selectedRisk ? "text-indigo-400" : ""}`} />
                    {selectedRisk || "Global Filter"}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                    {isFilterOpen && (
                        <>
                        <div className="fixed inset-0 z-50" onClick={() => setIsFilterOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-[calc(100%+12px)] w-60 p-2.5 rounded-[24px] border border-zinc-800 bg-zinc-950/90 backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-[60]"
                        >
                            <div className="px-4 py-3 text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] border-b border-zinc-900 mb-1.5">
                            Filter Severity
                            </div>
                            {risks.map((risk) => (
                            <button
                                key={risk.label}
                                onClick={() => {
                                    setSelectedRisk(selectedRisk === risk.label ? null : risk.label);
                                    setIsFilterOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-zinc-900 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${risk.bg} ${selectedRisk === risk.label ? "shadow-[0_0_12px_currentColor]" : "opacity-30"}`} />
                                    <span className={`text-xs font-bold ${selectedRisk === risk.label ? "text-white" : "text-zinc-500"} group-hover:text-white transition-colors`}>
                                        {risk.label}
                                    </span>
                                </div>
                                {selectedRisk === risk.label && <Check className="w-4 h-4 text-indigo-400" />}
                            </button>
                            ))}
                            {selectedRisk && (
                            <button 
                                onClick={() => {
                                    setSelectedRisk(null);
                                    setIsFilterOpen(false);
                                }}
                                className="w-full mt-1.5 pt-1.5 border-t border-zinc-900 px-4 py-3 text-[10px] font-black text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all text-left uppercase tracking-widest"
                            >
                                Reset Analysis View
                            </button>
                            )}
                        </motion.div>
                        </>
                    )}
                    </AnimatePresence>
                </div>

                <button className="group flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                    Sync
                </button>
            </div>
        </div>

        {/* Table section */}
        <MRTable data={MOCK_MRS} />
      </div>

      {/* Decorative background element */}
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-5%] w-[35%] h-[35%] bg-zinc-800/10 blur-[130px] rounded-full" />
      </div>
    </div>
  );
}
