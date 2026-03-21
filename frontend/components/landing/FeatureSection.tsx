"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureSectionProps {
  title: string;
  badge: string;
  description: string;
  icon: LucideIcon;
  reverse?: boolean;
  children: React.ReactNode;
}

export function FeatureSection({
  title,
  badge,
  description,
  icon: Icon,
  reverse,
  children,
}: FeatureSectionProps) {
  return (
    <section className="py-32 overflow-hidden">
      <div
        className={`max-w-6xl mx-auto px-6 flex flex-col items-center gap-20 ${
          reverse ? "lg:flex-row-reverse" : "lg:flex-row"
        }`}
      >
        {/* Text column */}
        <div className="flex-1 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            {/* Badge */}
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <span
                className="text-[12px] font-medium uppercase tracking-widest"
                style={{ color: "#52525b" }}
              >
                {badge}
              </span>
            </div>

            {/* Heading */}
            <h2
              className="font-semibold text-white leading-[1.1]"
              style={{
                fontSize: "clamp(32px, 4vw, 44px)",
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h2>

            {/* Description */}
            <p
              className="text-[16px] leading-[1.7]"
              style={{ color: "#71717a" }}
            >
              {description}
            </p>
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
