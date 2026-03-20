"use client";

import { motion } from "framer-motion";
import { LucideIcon, ChevronRight } from "lucide-react";

interface FeatureSectionProps {
  title: string;
  badge: string;
  description: string;
  icon: LucideIcon;
  reverse?: boolean;
  children: React.ReactNode;
}

export function FeatureSection({ title, badge, description, icon: Icon, reverse, children }: FeatureSectionProps) {
  return (
    <section className="py-40 bg-zinc-950 overflow-hidden">
      <div className={`max-w-7xl mx-auto px-6 flex flex-col items-center gap-20 ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
        <div className="flex-1 max-w-xl">
          <motion.div
            initial={{ opacity: 0, x: reverse ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-8"
          >
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl group hover:border-white/20 transition-all">
                  <Icon className="w-5 h-5 text-indigo-400" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">{badge}</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.05]">
              {title}
            </h2>

            <p className="text-lg font-medium text-zinc-500 leading-relaxed mb-6">
              {description}
            </p>

            <button className="self-start group flex items-center gap-3 px-8 py-4 bg-zinc-900/50 border border-zinc-900 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:border-zinc-700/50 transition-all active:scale-95">
              Read More
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        <div className="flex-1 w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: reverse ? -50 : 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
