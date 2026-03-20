"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Search, Filter, RefreshCw } from "lucide-react";
import { MRTable } from "@/components/MRTable";
import { MOCK_MRS } from "@/lib/mock-data";

export function Hero() {
  return (
    <section className="relative pt-40 pb-20 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-zinc-800/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="flex flex-col items-center justify-center text-center px-6">

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-8xl font-black text-white tracking-tight leading-[0.95] max-w-4xl text-center mb-10"
        >
          The risk intelligence system for modern teams
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl font-medium text-zinc-500 max-w-2xl text-center mb-12"
        >
          Analyze, prioritize, and secure your codebase with AI-powered forensic insights and automated threat detection.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex items-center"
        >
          <Link href="/login">
            <button className="group relative px-10 py-4 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-[0_15px_40px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
              Get Started
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </button>
          </Link>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-32 w-full max-w-6xl p-4 bg-zinc-950 border border-zinc-900 rounded-[32px] md:rounded-[48px] shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-linear-to-b from-indigo-500/10 to-transparent blur-3xl -z-10 rounded-[48px]" />
          <div className="absolute inset-0 bg-radial-gradient(circle at 50% -20%, white/5, transparent) pointer-events-none" />
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-col gap-6 p-8 shadow-inner backdrop-blur-md">
            {/* Mock Header from Image */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div className="flex flex-col gap-1.5 text-left">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Repository Feed</h3>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic flex items-center gap-2">
                        <span className="text-rose-500">1 high-risk</span> merge requests require immediate attention
                    </p>
                </div>
                
                <div className="flex items-center gap-4 bg-zinc-950/40 p-2 border border-zinc-900 rounded-[20px]">
                    <div className="relative hidden lg:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                        <div className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-bold text-white w-[200px]" />
                    </div>
                    
                    <div className="flex items-center gap-2.5 px-4 py-2 border border-zinc-800 bg-zinc-900 rounded-xl text-[9px] font-black uppercase text-zinc-500">
                        <Filter className="w-3 h-3" />
                        Global Filter
                    </div>

                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-wider">
                        <RefreshCw className="w-3 h-3" />
                        Sync
                    </button>
                </div>
            </div>

            {/* MR Table Preview Section */}
            <div className="relative group/table transition-all duration-500 overflow-hidden rounded-2xl border border-zinc-900">
                <MRTable data={MOCK_MRS.slice(0, 3)} previewMode={true} />
            </div>
            
            <div className="flex flex-col items-center gap-4 -mt-2 relative z-20">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                    Showing 3 of {MOCK_MRS.length} active merge requests
                </span>
                <div className="w-1 h-8 bg-linear-to-b from-zinc-800 to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
