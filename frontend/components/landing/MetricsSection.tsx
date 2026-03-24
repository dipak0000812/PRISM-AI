"use client";

import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef } from "react";

function CountUpNumber({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView && ref.current) {
      const controls = animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate(v) {
          if (ref.current) {
            ref.current.textContent = prefix + Math.floor(v) + suffix;
          }
        }
      });
      return () => controls.stop();
    }
  }, [isInView, value, prefix, suffix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

export function MetricsSection() {
  const metrics = [
    { value: 30, suffix: "M+", title: "GitLab users without blast radius data" },
    { value: 4, prefix: "~", suffix: "s", title: "from MR open to risk report posted" },
    { value: 100, suffix: "%", title: "automatic — no developer action required" },
    { value: 6, title: "deterministic risk signals, all explainable" }
  ];

  return (
    <section 
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "64px 0",
        background: "transparent"
      }}
      className="relative z-10 w-full"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#52525b",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "48px"
          }}
        >
          The numbers behind PRISM-AI
        </motion.h2>

        <div className="flex flex-col md:flex-row items-center justify-center relative">
          {metrics.map((m, i) => (
            <div key={i} className="flex items-center flex-1 w-full justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                style={{ textAlign: "center", width: "100%" }}
              >
                <div
                  style={{
                    fontSize: "42px",
                    fontWeight: 600,
                    color: "white",
                    fontFamily: "var(--font-geist-mono, monospace)",
                    letterSpacing: "-0.02em"
                  }}
                >
                  <CountUpNumber value={m.value} prefix={m.prefix} suffix={m.suffix} />
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#52525b",
                    marginTop: "8px",
                    maxWidth: "140px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    lineHeight: 1.5
                  }}
                >
                  {m.title}
                </div>
              </motion.div>

              {/* Divider */}
              {i < metrics.length - 1 && (
                <div className="hidden md:block mx-8 shrink-0">
                  <div
                    style={{
                      width: "1px",
                      height: "60px",
                      background: "rgba(255,255,255,0.06)"
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
