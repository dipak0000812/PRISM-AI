"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-40 px-6 relative overflow-hidden text-center">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(91,138,245,0.12), transparent)",
        }}
      />

      <div className="max-w-3xl mx-auto flex flex-col items-center gap-8">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-[13px] font-medium tracking-widest uppercase"
          style={{ color: "#52525b" }}
        >
          Ready to ship safer?
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="font-semibold text-white leading-[1.08]"
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            letterSpacing: "-0.03em",
          }}
        >
          Your codebase deserves
          <br />
          <span style={{ color: "rgba(255,255,255,0.5)" }}>
            better than hope.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-[17px] font-light leading-[1.6]"
          style={{ color: "#a1a1aa", maxWidth: 480 }}
        >
          PRISM gives every merge request a forensic risk score before a single
          human reviewer touches it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex items-center gap-4 flex-wrap justify-center"
        >
          <Link href="/dashboard">
            <button
              className="px-7 py-3.5 rounded-lg text-[14px] font-medium text-black bg-white hover:bg-zinc-100 transition-all duration-150 active:scale-[0.98]"
              style={{
                boxShadow: "0 0 0 1px rgba(255,255,255,0.1)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 24px rgba(91,138,245,0.35), 0 0 0 1px rgba(255,255,255,0.12)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 0 1px rgba(255,255,255,0.1)")
              }
            >
              Open Dashboard →
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
