"use client";

import { motion } from "framer-motion";

export function ProblemSection() {
  const questions = [
    { text: "Which downstream services depend on this file?", badge: "Unknown", badgeStyle: "red" },
    { text: "Has this module caused incidents before?", badge: "Unknown", badgeStyle: "red" },
    { text: "How deep does the dependency chain run?", badge: "Unknown", badgeStyle: "red" },
    { text: "Who has the most context to review this?", badge: "Guessing", badgeStyle: "yellow" },
  ];

  const stats = [
    { stat: "72% of outages", desc: "caused by unexpected dependencies" },
    { stat: "3–4 hours", desc: "average manual blast radius analysis" },
    { stat: "100%", desc: "of this is preventable with PRISM-AI" },
  ];

  return (
    <section
      style={{ padding: "100px 0", background: "transparent" }}
      className="relative z-10 w-full"
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Section label */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            display: "block",
            fontSize: "11px",
            letterSpacing: "0.15em",
            color: "#5b8af5",
            textTransform: "uppercase",
            fontWeight: 500,
            marginBottom: "16px",
          }}
        >
          THE PROBLEM
        </motion.span>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            lineHeight: 1.1,
            marginBottom: "48px",
          }}
        >
          Every merge is a blind bet.
        </motion.h2>

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            alignItems: "start",
          }}
          className="grid-cols-1 md:grid-cols-2"
        >
          {/* Left column — questions */}
          <div className="flex flex-col">
            {questions.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "10px",
                  padding: "18px 20px",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "border-color 200ms ease",
                }}
                whileHover={{ borderColor: "rgba(255,255,255,0.12)" }}
              >
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 400,
                    color: "#a1a1aa",
                    letterSpacing: "-0.01em",
                    marginRight: "16px",
                  }}
                >
                  {q.text}
                </span>
                <span
                  style={
                    q.badgeStyle === "yellow"
                      ? {
                          background: "rgba(255,178,36,0.1)",
                          border: "1px solid rgba(255,178,36,0.2)",
                          color: "#ffb224",
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          padding: "3px 10px",
                          borderRadius: "4px",
                          whiteSpace: "nowrap",
                          textTransform: "uppercase",
                        }
                      : {
                          background: "rgba(229,72,77,0.1)",
                          border: "1px solid rgba(229,72,77,0.2)",
                          color: "#e5484d",
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          padding: "3px 10px",
                          borderRadius: "4px",
                          whiteSpace: "nowrap",
                          textTransform: "uppercase",
                        }
                  }
                >
                  {q.badge}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Right column — cost card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{
              background: "rgba(229,72,77,0.06)",
              border: "1px solid rgba(229,72,77,0.2)",
              borderRadius: "16px",
              padding: "36px 32px",
            }}
          >
            <div
              style={{
                fontSize: "64px",
                fontWeight: 700,
                color: "#e5484d",
                fontFamily: "var(--font-geist-mono, monospace)",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                marginBottom: "6px",
              }}
            >
              $300K
            </div>
            <div style={{ fontSize: "13px", color: "#71717a", marginBottom: "2px" }}>
              average cost per hour
            </div>
            <div style={{ fontSize: "13px", color: "#52525b", marginBottom: "28px" }}>
              of a production outage
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(229,72,77,0.15)",
                margin: "20px 0",
              }}
            />

            <div className="flex flex-col">
              {stats.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom:
                      i < stats.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#f0f0f2",
                      fontFamily: "var(--font-geist-mono, monospace)",
                    }}
                  >
                    {item.stat}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#52525b",
                      textAlign: "right",
                      maxWidth: "160px",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
