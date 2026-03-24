"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureSectionProps {
  title: string;
  badge: string;
  badgeDotColor?: string;
  description: string;
  icon: LucideIcon;
  reverse?: boolean;
  children: React.ReactNode;
  textFooter?: React.ReactNode;
}

export function FeatureSection({
  title,
  badge,
  badgeDotColor = "#5b8af5",
  description,
  reverse,
  children,
  textFooter,
}: FeatureSectionProps) {
  return (
    <section className="py-[100px] overflow-hidden">
      <div
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}
        className={`flex flex-col items-center gap-20 ${
          reverse ? "lg:flex-row-reverse" : "lg:flex-row"
        }`}
      >
        {/* Text column */}
        <div
          className="flex-1 max-w-lg"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col"
          >
            {/* Pill badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(91,138,245,0.08)",
                border: "1px solid rgba(91,138,245,0.18)",
                borderRadius: "20px",
                padding: "5px 14px",
                width: "fit-content",
                fontSize: "10px",
                fontWeight: 500,
                color: "#5b8af5",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "0",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: badgeDotColor,
                  flexShrink: 0,
                }}
              />
              {badge}
            </span>

            {/* Heading */}
            <h2
              className="text-white"
              style={{
                fontSize: "clamp(28px, 3.5vw, 40px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                marginTop: "16px",
                marginBottom: "12px",
                lineHeight: 1.2,
              }}
            >
              {title}
            </h2>

            {/* Description */}
            <p
              style={{
                fontSize: "15px",
                color: "#71717a",
                lineHeight: 1.7,
                maxWidth: "400px",
                fontWeight: 400,
              }}
            >
              {description}
            </p>

            {/* Optional footer content (inline stats, etc.) */}
            {textFooter && <div style={{ marginTop: "32px" }}>{textFooter}</div>}
          </motion.div>
        </div>

        {/* Visual column */}
        <div className="flex-1 w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="w-full"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
