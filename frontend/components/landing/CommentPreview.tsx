"use client";

import { motion } from "framer-motion";

export function CommentPreview() {
  const lineVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section 
      style={{ padding: "80px 0", background: "transparent" }}
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
          THE OUTPUT
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
          What appears in your MR.
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
          Automatically. Every time. In under 4 seconds.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-12 items-start mt-20">
        
        {/* Left Column: Explanation */}
        <div className="flex flex-col gap-6 pt-8">
          {[
            "Risk score with severity level",
            "Blast radius dependency chain",
            "AI explanation in plain English",
            "Reviewers auto-assigned"
          ].map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
            >
              <span style={{ color: "#30a46c", fontSize: "16px", marginTop: "2px" }}>✓</span>
              <span style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.5 }}>{text}</span>
            </motion.div>
          ))}
        </div>

        {/* Right Column: Code Comment Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{
            background: "#111113",
            border: "1px solid #27272a",
            borderRadius: "12px",
            padding: "24px",
            fontFamily: "var(--font-geist-mono, monospace)",
            fontSize: "12px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)"
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(91,138,245,0.15)", border: "1px solid rgba(91,138,245,0.3)" }}>
              🛡️
            </div>
            <div className="flex flex-col font-sans">
              <span style={{ color: "#5b8af5", fontSize: "14px", fontWeight: 600 }}>PRISM-AI</span>
              <span style={{ color: "#52525b", fontSize: "12px" }}>Bot · just now</span>
            </div>
          </div>

          {/* Comment Body - Typing Animated */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1, 
                transition: { staggerChildren: 0.1, delayChildren: 0.5 } 
              }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-2"
          >
            <motion.div variants={lineVariants}>
              <span style={{ fontWeight: 600, color: "white" }}>🛡️ PRISM-AI — Risk Analysis Report</span>
            </motion.div>
            
            <motion.div variants={lineVariants} style={{ height: "4px" }} />
            
            <motion.div variants={lineVariants}>
              <span style={{ color: "white" }}>Risk Score: </span>
              <span style={{ color: "#e5484d", fontWeight: 600 }}>87</span>
              <span style={{ color: "white" }}> / 100</span>
            </motion.div>
            
            <motion.div variants={lineVariants}>
              <span style={{ color: "#e5484d", fontWeight: 600 }}>🔴 CRITICAL RISK</span>
            </motion.div>
            
            <motion.div variants={lineVariants}>
              <div style={{ height: "1px", background: "#27272a", margin: "12px 0" }} />
            </motion.div>
            
            <motion.div variants={lineVariants}>
              <span style={{ color: "#ffb224", fontWeight: 600 }}>💥 Blast Radius</span>
            </motion.div>
            
            <motion.div variants={lineVariants}>
              <span style={{ color: "#a1a1aa", fontSize: "11px" }}>
                auth/middleware.py → user_service → payment_service → billing
              </span>
            </motion.div>
            
            <motion.div variants={lineVariants}>
              <span style={{ color: "#52525b" }}>4 modules · 3 dependency layers</span>
            </motion.div>
            
            <motion.div variants={lineVariants} style={{ height: "4px" }} />
            
            <motion.div variants={lineVariants}>
              <span style={{ color: "#ffb224", fontWeight: 600 }}>📊 Top Risk Factors</span>
            </motion.div>

            <motion.div variants={lineVariants} className="flex gap-2 flex-wrap mt-1">
              {["Core Module +20", "File Churn +20", "Tests Removed +20"].map((pill, i) => (
                <span
                  key={i}
                  style={{
                    background: "#1a1a1e",
                    border: "1px solid #27272a",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    fontSize: "10px",
                    color: "#a1a1aa"
                  }}
                >
                  {pill}
                </span>
              ))}
            </motion.div>

            <motion.div variants={lineVariants} style={{ height: "4px" }} />
            
            <motion.div variants={lineVariants}>
              <span style={{ color: "#5b8af5", fontWeight: 500 }}>👥 Reviewers: @auth-lead @payments-team</span>
            </motion.div>
            
            <motion.div variants={lineVariants}>
              <div style={{ height: "1px", background: "#27272a", margin: "12px 0" }} />
            </motion.div>
            
            <motion.div variants={lineVariants}>
              <span style={{ color: "#3f3f46", fontSize: "10px" }}>Powered by PRISM-AI · ZerothLayer</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
