"use client";

import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { CommentPreview } from "@/components/landing/CommentPreview";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { CTASection } from "@/components/landing/CTASection";
import { TeamSection } from "@/components/landing/TeamSection";
import { Footer } from "@/components/landing/Footer";
import {
  Shield, Zap, Search, Globe,
  ShieldCheck, Network, GitBranch,
} from "lucide-react";
import { motion } from "framer-motion";

/* ─── Shared card-header dots ─── */
function CardDots() {
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e5484d" }} />
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffb224" }} />
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#30a46c" }} />
    </div>
  );
}

/* ─── Blast Radius depth chain card ─── */
function BlastRadiusCard() {
  const rows = [
    { title: "auth/middleware.py", sub: "CHANGED FILE", badge: "ORIGIN", depthColor: { bg: "rgba(229,72,77,0.1)", color: "#e5484d" } },
    { title: "user_service", sub: "DEPENDS ON AUTH", badge: "DEPTH 1", depthColor: { bg: "rgba(255,178,36,0.1)", color: "#ffb224" } },
    { title: "payment_service", sub: "TRANSITIVE DEP", badge: "DEPTH 2", depthColor: { bg: "rgba(255,178,36,0.08)", color: "#f59e0b" } },
    { title: "billing", sub: "DOWNSTREAM IMPACT", badge: "DEPTH 3", depthColor: { bg: "rgba(48,164,108,0.1)", color: "#30a46c" } },
  ];

  return (
    <div
      style={{
        background: "#0d0d10",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <CardDots />
        <span
          style={{
            background: "rgba(229,72,77,0.1)",
            border: "1px solid rgba(229,72,77,0.2)",
            color: "#e5484d",
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            padding: "3px 10px",
            borderRadius: "4px",
          }}
        >
          BLAST RADIUS: 4 MODULES
        </span>
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            padding: "14px 20px",
            borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: "rgba(255,255,255,0.04)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Network size={16} color="#52525b" strokeWidth={1.5} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#f0f0f2",
                  fontFamily: "var(--font-geist-mono, monospace)",
                }}
              >
                {row.title}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#52525b",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginTop: "2px",
                }}
              >
                {row.sub}
              </div>
            </div>
          </div>
          <span
            style={{
              background: row.depthColor.bg,
              color: row.depthColor.color,
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              padding: "3px 10px",
              borderRadius: "4px",
            }}
          >
            {row.badge}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Risk Score breakdown card ─── */
function RiskScoreCard() {
  const factors = [
    { label: "Core Module", pts: "+20" },
    { label: "File Churn", pts: "+20" },
    { label: "Tests Removed", pts: "+20" },
    { label: "New Contributor", pts: "+15" },
    { label: "Large Diff", pts: "+15" },
    { label: "No Reviewers", pts: "+10" },
  ];

  return (
    <div
      style={{
        background: "#0d0d10",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <CardDots />
        <span
          style={{
            background: "rgba(229,72,77,0.1)",
            border: "1px solid rgba(229,72,77,0.2)",
            color: "#e5484d",
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            padding: "3px 10px",
            borderRadius: "4px",
          }}
        >
          87 / 100 · CRITICAL
        </span>
      </div>

      {/* Factor rows */}
      {factors.map((sig, i) => (
        <div
          key={i}
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "#a1a1aa",
              fontFamily: "var(--font-geist-mono, monospace)",
            }}
          >
            {sig.label}
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#ffb224",
              fontFamily: "var(--font-geist-mono, monospace)",
            }}
          >
            {sig.pts}
          </span>
        </div>
      ))}

      {/* Total row */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            color: "#71717a",
            fontFamily: "var(--font-geist-mono, monospace)",
          }}
        >
          Total Score
        </span>
        <span
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#e5484d",
            fontFamily: "var(--font-geist-mono, monospace)",
          }}
        >
          87 / 100
        </span>
      </div>
    </div>
  );
}

/* ─── Inline stats footer for Risk Score section ─── */
function RiskScoreStats() {
  const stats = [
    { num: "6", label: "risk signals" },
    { num: "0–100", label: "score range" },
    { num: "100%", label: "explainable" },
  ];

  return (
    <div style={{ display: "flex", gap: "32px" }}>
      {stats.map((s, i) => (
        <div key={i} className="flex flex-col">
          <span
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "white",
              fontFamily: "var(--font-geist-mono, monospace)",
              lineHeight: 1,
            }}
          >
            {s.num}
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "#52525b",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginTop: "4px",
            }}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── AI Pipeline card (Feature 3) ─── */
function AIPipelineCard() {
  const steps = [
    { label: "AST Analysis", icon: GitBranch, color: "text-zinc-500", bg: "bg-zinc-500/10" },
    { label: "Risk Score: 87", icon: Shield, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Groq LLM", icon: Zap, color: "text-white", bg: "bg-indigo-600", isSpecial: true },
    { label: "Plain English", icon: Search, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "MR Comment Posted", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div
      style={{
        background: "#0d0d10",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        overflow: "hidden",
        padding: "32px",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center gap-3 w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className={`flex items-center gap-3 px-5 py-3 min-w-[220px] border border-white/5 rounded-xl transition-all duration-300 ${step.bg} ${step.isSpecial ? "shadow-[0_0_24px_rgba(99,102,241,0.4)] border-white/20" : ""}`}
            >
              <step.icon className={`w-4 h-4 ${step.color} shrink-0`} />
              <span className={`text-[12px] font-semibold uppercase tracking-wider ${step.isSpecial ? "text-white" : "text-zinc-400"}`}>
                {step.label}
                {step.isSpecial && <span className="ml-2">⚡</span>}
              </span>
            </motion.div>
            {i < steps.length - 1 && (
              <div className="w-px h-4 bg-white/10" />
            )}
          </div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
          style={{ marginTop: "8px" }}
          className="flex items-center gap-4 px-4 py-2 bg-black/40 border border-white/5 rounded-full"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
              Analysis complete in &lt;4s
            </span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">
            Comment posted
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen text-white selection:bg-white selection:text-black scroll-smooth"
      style={{
        background: "#08080a",
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(91,138,245,0.15), transparent),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")
        `,
      }}
    >
      <LandingNavbar />

      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <MetricsSection />
        <CommentPreview />

        <div id="features" className="scroll-mt-24">

          {/* Section 1: Forensic Analysis */}
          <FeatureSection
            badge="Blast Radius"
            title="Blast Radius Engine"
            description="tree-sitter parses your codebase into an AST. NetworkX BFS traversal maps every downstream module at risk. Color-coded by impact depth."
            icon={Shield}
          >
            <BlastRadiusCard />
          </FeatureSection>

          {/* Feature 2 — Deterministic Risk Score */}
          <FeatureSection
            badge="Risk Scoring"
            badgeDotColor="#ffb224"
            title="Deterministic Risk Score"
            description="Six signals. No black box. Every point is traceable to a specific, measurable fact from your git history and code structure."
            icon={Shield}
            reverse
            textFooter={<RiskScoreStats />}
          >
            <RiskScoreCard />
          </FeatureSection>

          {/* Feature 3: AI That Explains, Not Decides */}
          <FeatureSection
            badge="AI Summary"
            badgeDotColor="#30a46c"
            title="AI That Explains, Not Decides"
            description="Groq LLM translates structured analysis into plain English. The algorithms make the risk decision. The AI communicates it."
            icon={Zap}
          >
            <AIPipelineCard />
          </FeatureSection>
        </div>

        <CTASection />
      </main>

      <TeamSection />
      <Footer />
    </div>
  );
}
