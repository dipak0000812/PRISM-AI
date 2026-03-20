"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, GitPullRequest, Clock, User, ShieldCheck, AlertTriangle, FileCode, Server } from "lucide-react";
import Link from "next/link";
import { RiskGauge } from "@/components/RiskGauge";
import { AISummaryCard } from "@/components/AISummaryCard";
import { BlastRadiusGraph } from "@/components/BlastRadiusGraph";
import { MOCK_MRS, MOCK_GRAPH_DATA } from "@/lib/mock-data";

export default function MRDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const mr = MOCK_MRS.find((m) => m.id === id) || MOCK_MRS[0];

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400">
                REF: auth-refactor
             </div>
             <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Target: master
             </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg">
                <GitPullRequest className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">
                {mr.title}
            </h1>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <User className="w-4 h-4" />
                Authored by <span className="text-white">{mr.author}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <Clock className="w-4 h-4" />
                Analyzed {mr.updatedAt}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verified by PRISM Agent
            </div>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metrics & Summary */}
        <div className="lg:col-span-1 flex flex-col gap-8">
            <RiskGauge score={mr.riskScore} />
            
            <div className="flex flex-col gap-4 p-6 glass rounded-2xl border border-zinc-900">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Key Risk Indicators</h3>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            <span className="text-xs font-medium text-zinc-300">Auth Bypass Potential</span>
                        </div>
                        <span className="text-[10px] font-bold text-rose-500">CRITICAL</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-orange-500" />
                            <span className="text-xs font-medium text-zinc-300">Large File Churn</span>
                        </div>
                        <span className="text-[10px] font-bold text-orange-500">HIGH</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs font-medium text-zinc-300">API Contract Change</span>
                        </div>
                        <span className="text-[10px] font-bold text-yellow-500">MEDIUM</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: AI Summary & Graph */}
        <div className="lg:col-span-2 flex flex-col gap-8">
            <AISummaryCard 
                delay={0.5}
                text="This PR introduces foundational changes to the authentication middleware. While multi-tenant support is required, the current implementation bypasses JWT validation for specific route patterns, creating a potential security regression. We recommend manual review of the `validateSession` logic in `auth.ts` before merging."
            />
            
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                     <div className="flex flex-col">
                        <h3 className="text-sm font-bold text-white">Blast Radius Visualization</h3>
                        <p className="text-[10px] text-zinc-500 font-medium tracking-tight">AST-based dependency analysis</p>
                     </div>
                     <Link href={`/graph?id=${mr.id}`} className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                        Full Screen Explorer
                     </Link>
                </div>
                <BlastRadiusGraph data={mr.graphData || MOCK_GRAPH_DATA} height={400} showMaximize={false} />
            </div>
        </div>
      </div>

      {/* Detailed Risk Breakdown Table Mockup */}
      <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white px-2">Impacted Modules Breakdown</h3>
          <div className="glass rounded-2xl border border-zinc-900 overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-zinc-950/50 border-b border-zinc-900">
                      <tr>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase text-zinc-500">Module Path</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase text-zinc-500 text-center">Impact Level</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase text-zinc-500 text-right">Complexity Inc.</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr className="border-b border-zinc-900/50">
                          <td className="px-6 py-4 text-xs font-mono text-zinc-300">src/services/auth.ts</td>
                          <td className="px-6 py-4 text-center"><span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 uppercase tracking-tighter">Direct</span></td>
                          <td className="px-6 py-4 text-right text-xs font-bold text-white">+14.2%</td>
                      </tr>
                      <tr className="border-b border-zinc-900/50">
                          <td className="px-6 py-4 text-xs font-mono text-zinc-300">src/middleware/auth-check.ts</td>
                          <td className="px-6 py-4 text-center"><span className="text-[9px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 uppercase tracking-tighter">Transitive</span></td>
                          <td className="px-6 py-4 text-right text-xs font-bold text-white">+5.8%</td>
                      </tr>
                      <tr>
                          <td className="px-6 py-4 text-xs font-mono text-zinc-300">src/api/v1/users.ts</td>
                          <td className="px-6 py-4 text-center"><span className="text-[9px] font-bold text-zinc-500 bg-zinc-500/10 px-2 py-0.5 rounded-full border border-zinc-500/20 uppercase tracking-tighter">Distant</span></td>
                          <td className="px-6 py-4 text-right text-xs font-bold text-white">+1.2%</td>
                      </tr>
                  </tbody>
               </table>
          </div>
      </div>
    </div>
  );
}
