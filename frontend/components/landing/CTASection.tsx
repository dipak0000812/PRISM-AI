"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-40 bg-black px-6 relative overflow-hidden text-center">
      {/* Moving Background Glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" 
      />
      
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-12 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase leading-[0.85]"
        >
          Secure your codebase today
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl font-bold text-zinc-500/80 uppercase tracking-widest italic"
        >
          Automated risk intelligence for the modern enterprise.
        </motion.p>

        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ delay: 0.2 }}
           className="relative group"
        >
          <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-indigo-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <Link href="/login">
            <button className="relative px-16 py-6 bg-white text-black font-black text-[11px] uppercase tracking-[0.4em] rounded-[24px] hover:bg-zinc-100 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_60px_rgba(255,255,255,0.15)] flex items-center gap-4">
              <Zap className="w-4 h-4 fill-current" />
              Get Started Free
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
