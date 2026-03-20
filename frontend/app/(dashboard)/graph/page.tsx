"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BlastRadiusGraph } from "@/components/BlastRadiusGraph";
import { MOCK_MRS, MOCK_MR } from "@/lib/mock-data";
import { Filter, Layers, Zap, ChevronDown, GitPullRequest } from "lucide-react";
import { Node, Link } from "@/components/BlastRadiusGraph";

type ViewMode = "all" | "high-risk" | "files";

export default function GraphExplorerPage() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedMR, setSelectedMR] = useState<MOCK_MR>(MOCK_MRS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      const mr = MOCK_MRS.find((m) => m.id === id);
      if (mr) setSelectedMR(mr);
    }
  }, [searchParams]);

  const filteredData = useMemo(() => {
    let baseData = selectedMR.graphData;
    let filteredNodes = [...baseData.nodes];
    
    if (viewMode === "high-risk") {
      filteredNodes = baseData.nodes.filter(
        (n: Node) => n.risk === "critical" || n.risk === "high"
      );
    } else if (viewMode === "files") {
      filteredNodes = baseData.nodes.filter((n: Node) => n.type === "file");
    }

    const nodeIds = new Set(filteredNodes.map((n: Node) => n.id));
    const filteredLinks = baseData.links.filter((l: Link) => {
      const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    return { nodes: filteredNodes, links: filteredLinks };
  }, [viewMode, selectedMR]);

  return (
    <div className="flex flex-col gap-12 pb-20 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col gap-3">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="flex items-center gap-2.5"
         >
           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
             Advanced Intelligence
           </span>
         </motion.div>
        
        <div className="flex items-end justify-between border-b border-zinc-900/50 pb-6">
          <div className="flex flex-col gap-1">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black tracking-tighter text-white"
            >
              Blast Radius Explorer
            </motion.h1>
            <p className="text-xs text-zinc-500 font-medium tracking-tight">
              Visualizing transitive impacts and service dependency chains across the monolith.
            </p>
          </div>
          <div className="flex items-center gap-4">
             {/* MR Dropdown Selector */}
             <div className="relative">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2 pl-1">Select Merge Request</p>
                <div 
                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                   className="w-[220px] bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all backdrop-blur-md group"
                >
                   <div className="flex items-center gap-3 overflow-hidden">
                      <GitPullRequest className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="text-xs font-bold text-white/80 truncate">MR #{selectedMR.id} - {selectedMR.title}</span>
                   </div>
                   <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                   {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-2 backdrop-blur-2xl"
                      >
                         {MOCK_MRS.map((mr: MOCK_MR) => (
                            <div 
                               key={mr.id}
                               onClick={() => {
                                  setSelectedMR(mr);
                                  setIsDropdownOpen(false);
                               }}
                               className={`px-4 py-3 text-xs font-bold hover:bg-white/5 cursor-pointer transition-colors ${selectedMR.id === mr.id ? 'text-indigo-400 bg-white/5' : 'text-zinc-400 hover:text-white'}`}
                            >
                               MR #{mr.id} — {mr.title}
                            </div>
                         ))}
                      </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 bg-zinc-900/30 p-1 rounded-2xl border border-zinc-900/50">
          {[
            { id: "all", label: "All Services", icon: Layers },
            { id: "high-risk", label: "High Risk", icon: Zap },
            { id: "files", label: "Dependencies", icon: Filter }
          ].map((mode) => (
            <button 
              key={mode.id}
              onClick={() => setViewMode(mode.id as ViewMode)}
              className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                viewMode === mode.id 
                ? "text-white bg-zinc-800 shadow-lg border border-zinc-700/50" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              }`}
            >
              <mode.icon className={`w-3.5 h-3.5 ${viewMode === mode.id ? "text-indigo-400" : ""}`} />
              {mode.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Viewing: {selectedMR.title}</span>
          <span className="text-[11px] font-bold text-white italic">MR #{selectedMR.id}</span>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-linear-to-b from-indigo-500/10 to-transparent blur-3xl -z-10 opacity-50" />
        
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] overflow-hidden backdrop-blur-sm p-4 md:p-6 lg:p-8">
           <AnimatePresence mode="wait">
              <motion.div 
                 key={selectedMR.id}
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 1.02 }}
                 transition={{ duration: 0.4, ease: "easeInOut" }}
                 className="relative h-[700px] w-full bg-zinc-950/50 rounded-[24px] border border-zinc-900/80 overflow-hidden"
              >
                  <BlastRadiusGraph data={filteredData} height={700} width={1200} />
                  
                  <div className="absolute top-8 left-8 z-10 pointer-events-none max-w-[280px]">
                       <motion.div 
                            key={`${viewMode}-${selectedMR.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-zinc-900/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl"
                        >
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                              <h4 className="text-[10px] font-black tracking-[0.2em] text-white uppercase">Intelligence Insight</h4>
                            </div>
                            <p className="text-xs leading-relaxed text-zinc-400 font-medium">
                                {viewMode === "all" ? (
                                     <>Impact path detected for <span className="text-white font-bold">{selectedMR.title}</span>. Analyzing <span className="text-white font-bold">{filteredData.nodes.length} nodes</span> within the projected blast radius.</>
                                ) : viewMode === "high-risk" ? (
                                     <>Surfacing prioritized <span className="text-rose-500 font-bold">Threat Nodes</span> for MR #{selectedMR.id}. Focus review efforts on these transitive dependencies.</>
                                ) : (
                                     <>Direct file impacts for <span className="text-white font-bold">{selectedMR.title}</span>. Surfacing code-level side effects for faster forensic audit.</>
                                )}
                            </p>
                       </motion.div>
                  </div>
              </motion.div>
           </AnimatePresence>
        </div>
      </div>

      <div className="fixed inset-0 -z-50 pointer-events-none">
        <div className="absolute top-[20%] left-[-5%] w-[40%] h-[40%] bg-indigo-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-zinc-800/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
