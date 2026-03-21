"use client";

import { motion, Easing } from "framer-motion";
import Link from "next/link";
import { MRTable } from "@/components/MRTable";
import { MOCK_MRS } from "@/lib/mock-data";
import { Search, Filter, RefreshCw } from "lucide-react";

const EASE: Easing = "easeOut";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: EASE },
});

const STATS = [
  { value: "< 4s", label: "analysis" },
  { value: "6", label: "risk factors" },
  { value: "LLM", label: "AI summaries" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 overflow-hidden px-6">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(91,138,245,0.15), transparent)",
        }}
      />

      {/* Badge */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <span
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-medium text-[#a1a1aa]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 20px rgba(91,138,245,0.15)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          GitLab AI Hackathon 2026
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        {...fadeUp(0.1)}
        className="text-center font-semibold leading-[1.08] tracking-[-0.03em] text-white"
        style={{ fontSize: "clamp(48px, 7vw, 80px)", maxWidth: 780 }}
      >
        Every merge request,
        <br />
        <span style={{ color: "rgba(255,255,255,0.6)" }}>
          risk-analyzed instantly.
        </span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        {...fadeUp(0.2)}
        className="mt-6 text-[20px] font-light text-center leading-[1.6]"
        style={{ color: "#a1a1aa", maxWidth: 560 }}
      >
        PRISM activates the moment a developer opens a merge request. Blast
        radius, risk score, AI explanation — before any human reviews the code.
      </motion.p>

      {/* CTAs */}
      <motion.div
        {...fadeUp(0.3)}
        className="mt-10 flex items-center gap-4 flex-wrap justify-center"
      >
        <Link href="/dashboard">
          <button
            className="px-6 py-3 rounded-lg text-[14px] font-medium text-black bg-white hover:bg-zinc-100 transition-all duration-150 active:scale-[0.98]"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.1), 0 4px 24px rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 20px rgba(91,138,245,0.3), 0 4px 24px rgba(255,255,255,0.12)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 0 1px rgba(255,255,255,0.1), 0 4px 24px rgba(255,255,255,0.08)")
            }
          >
            View Dashboard →
          </button>
        </Link>
        <Link href="#features">
          <button
            className="px-6 py-3 rounded-lg text-[14px] font-medium text-[#a1a1aa] hover:text-white transition-colors duration-150 active:scale-[0.98]"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            See how it works
          </button>
        </Link>
      </motion.div>

      {/* Stat row */}
      <motion.div
        {...fadeUp(0.4)}
        className="mt-8 flex items-center gap-6 flex-wrap justify-center"
      >
        {STATS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[13px]">
            <span
              className="font-medium text-white"
              style={{ fontFamily: "var(--font-geist-mono, monospace)" }}
            >
              {s.value}
            </span>
            <span style={{ color: "#52525b" }}>{s.label}</span>
            {i < STATS.length - 1 && (
              <span className="ml-2" style={{ color: "#3f3f46" }}>
                ·
              </span>
            )}
          </div>
        ))}
      </motion.div>

      {/* Dashboard Preview */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mt-20 w-full"
        style={{ maxWidth: 1080 }}
      >
        <div
          className="rounded-[24px] overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* Fake terminal bar */}
          <div
            className="flex items-center gap-2 px-5 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            <div
              className="ml-4 text-[11px]"
              style={{ color: "#52525b", fontFamily: "monospace" }}
            >
              PRISM Risk Dashboard — prism-demo-app
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Header row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-[13px] font-semibold text-white">Repository Feed</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#52525b" }}>
                  <span className="text-rose-400">1 high-risk</span> merge requests require attention
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px]"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#52525b",
                  }}
                >
                  <Search className="w-3 h-3" /> Search
                </div>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px]"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#52525b",
                  }}
                >
                  <Filter className="w-3 h-3" /> Filter
                </div>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-black bg-white font-medium hover:bg-zinc-100 transition-colors active:scale-[0.98]"
                >
                  <RefreshCw className="w-3 h-3" /> Sync
                </button>
              </div>
            </div>

            {/* MR Table */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <MRTable data={MOCK_MRS.slice(0, 3)} previewMode={true} />
            </div>

            <p
              className="text-center text-[11px]"
              style={{ color: "#3f3f46" }}
            >
              Showing 3 of {MOCK_MRS.length} active merge requests
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
