"use client";

import { motion } from "framer-motion";
import { GitBranch, Network, ShieldCheck, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <GitBranch size={20} color="#5b8af5" strokeWidth={2.5} />,
      title: "MR Opens on GitLab",
      description: "Developer opens or updates a merge request. GitLab fires a webhook to PRISM-AI instantly.",
    },
    {
      number: "02",
      icon: <Network size={20} color="#5b8af5" strokeWidth={2.5} />,
      title: "Pipeline Activates",
      description: "7-agent pipeline runs: AST parsing, dependency graph BFS, git history analysis, risk scoring, reviewer matching.",
    },
    {
      number: "03",
      icon: <ShieldCheck size={20} color="#5b8af5" strokeWidth={2.5} />,
      title: "Report Posted Automatically",
      description: "Risk score, blast radius map, AI summary, and reviewer assignments appear in the MR — before any human opens the diff.",
    }
  ];

  return (
    <section 
      style={{ background: "transparent", padding: "80px 0" }}
      className="relative z-10 w-full max-w-6xl mx-auto px-6"
    >
      <div className="flex flex-col items-center justify-center text-center mb-16">
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            fontSize: "11px",
            letterSpacing: "0.15em",
            color: "#5b8af5",
            textTransform: "uppercase",
            marginBottom: "16px"
          }}
        >
          THE WORKFLOW
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: "clamp(36px, 4vw, 52px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "white",
            marginBottom: "12px"
          }}
        >
          Open an MR. That's it.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: "16px",
            color: "#a1a1aa",
          }}
        >
          PRISM-AI handles everything else automatically.
        </motion.p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center flex-1 w-full md:w-auto relative group">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px",
                padding: "28px 24px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                zIndex: 2,
              }}
              className="hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-8">
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#5b8af5",
                    fontFamily: "var(--font-geist-mono, monospace)",
                    letterSpacing: "0.1em"
                  }}
                >
                  {step.number}
                </span>
                {step.icon}
              </div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#f0f0f2",
                  marginBottom: "8px"
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "#71717a",
                  lineHeight: 1.6
                }}
              >
                {step.description}
              </p>
            </motion.div>

            {/* Connecting Arrow */}
            {i < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.2, duration: 0.4 }}
                className="hidden md:flex flex-shrink-0 mx-4 z-1"
              >
                <ArrowRight size={40} color="#27272a" strokeWidth={1.5} />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
