"use client";

import { motion, Easing } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, Filter, RefreshCw, Terminal, Activity, FileCode2, Network, ShieldCheck } from "lucide-react";

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

const CODE_SNIPPET = `+ export async function verifyPayment(req, res) {
+   const token = req.headers.authorization;
+   // FIXME: Bypassing auth temporarily for load testing
+   // const user = await jwt.verify(token, process.env.SECRET);
+   const user = { role: "admin" }; 
+ 
+   await db.payments.insert({ amount: req.body.amount });
+   return res.status(200).json({ success: true });
+ }`;

export function Hero() {
  const { data: session } = useSession();
  const ctaHref = session ? '/dashboard' : '/login';

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
        <Link href={ctaHref}>
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

      {/* Animated Engine Preview */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mt-20 w-full"
        style={{ maxWidth: 1080 }}
      >
        <div
          className="rounded-[24px] overflow-hidden relative group"
          style={{
            background: "rgba(10,10,12,0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* Fake terminal top bar */}
          <div
            className="flex items-center gap-3 px-5 py-3.5 relative z-10"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}
          >
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-sm" />
            </div>
            <div className="flex items-center gap-2 ml-4">
              <ShieldCheck className="w-4 h-4 text-zinc-500" />
              <span className="text-[11px] font-mono text-zinc-400">PRISM Analysis Engine Core</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] relative">
            {/* Left Side: Code block being scanned */}
            <div className="p-6 md:p-8 flex flex-col gap-4 border-r border-zinc-900 overflow-hidden relative">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <FileCode2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-[12px] font-medium text-emerald-500 font-mono tracking-wider">Incoming MR / auth_bypass.js</span>
                </div>
                <div className="relative font-mono text-[12px] md:text-[13px] leading-[1.7] text-zinc-300 whitespace-pre overflow-x-auto">
                  {/* The Scanning Laser Line */}
                  <motion.div
                    className="absolute left-0 right-0 h-8 opacity-40 mix-blend-screen pointer-events-none"
                    style={{
                      background: "linear-gradient(to bottom, transparent, rgba(239, 68, 68, 0.4), transparent)",
                      boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
                    }}
                    animate={{ y: ["0%", "300%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                  {CODE_SNIPPET.split('\n').map((line, i) => (
                    <div key={i} className="flex hover:bg-zinc-900/50 transition-colors">
                      <span className="w-8 shrink-0 text-zinc-600 text-right pr-4 select-none mr-2 border-r border-zinc-800">{i + 14}</span>
                      <span className={`${line.includes('FIXME') || line.includes('role: "admin"') ? 'text-rose-400 font-semibold' : 'text-emerald-400/90'}`}>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Execution & Risk Output */}
            <div className="p-6 md:p-8 flex flex-col justify-between bg-black/40">
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-[12px] font-medium text-indigo-400 font-mono tracking-wider uppercase">Execution Feed</span>
                </div>
                
                <div className="flex flex-col gap-3 font-mono text-[11px] md:text-[12px]">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex gap-3 text-zinc-400">
                    <span className="text-zinc-600">[0.02s]</span> <span>Constructing Abstract Syntax Tree...</span>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="flex gap-3 text-zinc-400">
                    <span className="text-zinc-600">[0.08s]</span> <span>Mapping cross-module dependencies... <span className="text-emerald-500">OK</span></span>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }} className="flex gap-3 text-rose-400">
                    <span className="text-zinc-600">[0.14s]</span> <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> CRITICAL: Auth middleware bypass detected</span>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }} className="flex gap-3 text-zinc-400">
                    <span className="text-zinc-600">[0.21s]</span> <span>Calculating blast radius coefficient...</span>
                  </motion.div>
                </div>
              </div>

              {/* Final Risk Pill Pop */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 3.2, duration: 0.5, type: "spring" }}
                className="mt-8 p-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 relative overflow-hidden group/risk"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-rose-500/80 font-bold">Analysis Verdict</span>
                    <span className="text-2xl font-bold text-rose-500 flex items-center gap-2">
                       Risk Score: 94
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-rose-500/30 bg-rose-500/20 flex items-center justify-center">
                     <Network className="w-6 h-6 text-rose-500" />
                  </div>
                </div>
                <div className="mt-4 text-[12px] text-zinc-400 leading-relaxed">
                  <span className="text-zinc-200 font-medium">AI Summary:</span> Code modifies core payment logic while hardcoding admin roles. Extreme blast radius (14 connected modules). Merge strongly discouraged.
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
