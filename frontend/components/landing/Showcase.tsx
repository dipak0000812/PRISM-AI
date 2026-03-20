"use client";

import { motion } from "framer-motion";
import { GitBranch, Activity, Shield, Zap, User, Share2 } from "lucide-react";

export function Showcase() {
  return (
    <section className="py-28 border-t border-white/10 bg-black overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-6 text-center mb-24">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none uppercase mb-8"
        >
          The ultimate engine for securing modern platforms.
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg font-bold text-white/70 uppercase tracking-widest italic"
        >
          Built for teams that ship fast and secure.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 max-w-7xl mx-auto group/container">
        {/* Card 1: Merge Intelligence */}
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.2 }}
           className="group relative p-8 bg-zinc-900/30 border border-white/10 rounded-[40px] transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] group-hover/container:opacity-70 hover:opacity-100! overflow-hidden"
        >
           <div className="flex flex-col gap-6 relative z-20">
              <div className="flex items-center justify-between">
                 <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                    <GitBranch className="w-5 h-5 text-indigo-400" />
                 </div>
                 <div className="relative group/shimmer overflow-hidden px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full">
                    <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest">CRITICAL</span>
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/shimmer:animate-shimmer" />
                 </div>
              </div>

              <div className="space-y-3">
                 {[
                    { title: "Fix Auth Secret", author: "rivara", risk: "CRITICAL", active: true },
                    { title: "Optimize Query", author: "smith", risk: "LOW" },
                    { title: "Refactor API", author: "lee", risk: "LOW" }
                 ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 ${item.active ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent opacity-40'}`}>
                       <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                          <User className="w-4 h-4 text-zinc-500" />
                       </div>
                       <div className="flex-1 overflow-hidden">
                          <p className="text-[11px] font-black text-white truncate uppercase">{item.title}</p>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">@{item.author}</p>
                       </div>
                       {item.active && <Activity className="w-3.5 h-3.5 text-rose-500 animate-pulse" />}
                    </div>
                 ))}
              </div>

              <div className="pt-2 text-center">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Merge Intelligence</h3>
                 <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1.5">Analyze every pull request in real-time</p>
              </div>
           </div>
           {/* Background Subtle Gradient */}
           <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-indigo-500/5 to-transparent -z-10 group-hover:opacity-100 opacity-0 transition-opacity" />
        </motion.div>

        {/* Card 2: Graph Visualizer */}
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.3 }}
           className="group relative p-8 bg-zinc-900/30 border border-white/10 rounded-[40px] transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] group-hover/container:opacity-70 hover:opacity-100!"
        >
           <div className="flex flex-col gap-6 relative z-20">
              <div className="flex items-center justify-between">
                 <div className="p-2.5 bg-sky-500/10 rounded-xl">
                    <Share2 className="w-5 h-5 text-sky-400" />
                 </div>
                 <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase text-zinc-500 tracking-widest">Live Analysis</div>
              </div>

              <div className="h-40 flex items-center justify-center relative">
                 <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 bg-sky-500/10 border border-sky-500/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(56,189,248,0.2)]"
                 >
                    <div className="w-4 h-4 bg-sky-400 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
                 </motion.div>
                 {/* Orbiting Dots */}
                 <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
                    <div className="w-2.5 h-2.5 bg-zinc-700 rounded-full absolute -top-4 -left-4" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full absolute bottom-2 right-12" />
                    <div className="w-2 h-2 bg-rose-500 rounded-full absolute top-12 -right-2" />
                 </div>
                 <div className="absolute inset-0 border border-dashed border-white/5 rounded-full scale-125 pointer-events-none" />
              </div>

              <div className="pt-2 text-center mt-2">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Graph Visualizer</h3>
                 <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1.5">Visualize dependencies and attack paths</p>
              </div>
           </div>
           <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-sky-500/5 to-transparent -z-10 group-hover:opacity-100 opacity-0 transition-opacity" />
        </motion.div>

        {/* Card 3: Advanced Forensics */}
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.4 }}
           className="group relative p-8 bg-zinc-900/30 border border-white/10 rounded-[40px] transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] group-hover/container:opacity-70 hover:opacity-100!"
        >
           <div className="flex flex-col gap-6 relative z-20">
              <div className="flex items-center justify-between">
                 <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                    <Shield className="w-5 h-5 text-emerald-400" />
                 </div>
                 <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[9px] font-black uppercase text-emerald-400 tracking-widest">Active</div>
              </div>

              <div className="space-y-4">
                 {[
                    { label: "Anomaly Scan", active: true },
                    { label: "Logic Inversion", active: false },
                    { label: "Auth Bypass", active: true }
                 ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-zinc-400/5 border border-white/5 rounded-2xl hover:bg-white/5 transition-colors group/toggle">
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover/toggle:text-white transition-colors">{item.label}</span>
                       <div className={`w-9 h-5 rounded-full relative transition-colors duration-500 ${item.active ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                          <div className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm ${item.active ? 'right-0.5' : 'left-0.5'}`} />
                       </div>
                    </div>
                 ))}
              </div>

              <div className="pt-2 text-center">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Advanced Forensics</h3>
                 <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1.5">Detect deep security vulnerabilities</p>
              </div>
           </div>
           <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-emerald-500/5 to-transparent -z-10 group-hover:opacity-100 opacity-0 transition-opacity" />
        </motion.div>
      </div>
    </section>
  );
}
