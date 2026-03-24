"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";

const members = [
  {
    firstName: "Dipak",
    lastName: "Dhangar",
    role: "Team Lead · AI/ML Engineer",
    image: "/team/dipak.jpeg",
    index: "01",
    accent: "#5b8af5",
  },
  {
    firstName: "Purva",
    lastName: "Ahirrao",
    role: "Backend Developer",
    image: "/team/purva.jpg",
    index: "02",
    accent: "#4a77e8",
    objectPosition: "center 15%"
  },
  {
    firstName: "Nihar",
    lastName: "Patil",
    role: "Frontend Developer",
    image: "/team/nihar.jpeg",
    index: "03",
    accent: "#7fa3f8",
    objectPosition: "center 50%"

  },
  {
    firstName: "Aakanksha",
    lastName: "Borse",
    role: "Presenter · Strategy",
    image: "/team/aakanksha.jpeg",
    index: "04",
    accent: "#8baef9",
    objectPosition: "center 10%"
  },
];

/* ─── Magnetic card with 3-D tilt + spotlight ──────────────────────── */
function MemberCard({
  member,
  i,
}: {
  member: (typeof members)[0];
  i: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springConfig = { stiffness: 260, damping: 28 };
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-8, 8]), springConfig);
  const glowX = useSpring(useTransform(rawX, [-1, 1], [20, 80]), springConfig);
  const glowY = useSpring(useTransform(rawY, [-1, 1], [20, 80]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    rawX.set(nx);
    rawY.set(ny);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    setHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: 0.12 * i,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ perspective: 900 }}
    >
      <motion.div
        ref={ref}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Glass card */}
        <div
          style={{
            position: "relative",
            borderRadius: "20px",
            padding: "32px 24px 28px",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)",
            border: hovered
              ? `1px solid rgba(91,138,245,0.35)`
              : "1px solid rgba(255,255,255,0.07)",
            boxShadow: hovered
              ? `0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(91,138,245,0.12), inset 0 1px 0 rgba(255,255,255,0.06)`
              : `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)`,
            transition: "border-color 350ms ease, box-shadow 350ms ease",
            cursor: "default",
            overflow: "hidden",
          }}
        >
          {/* Spotlight gradient that follows cursor */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              opacity: hovered ? 1 : 0,
              background: useTransform(
                [glowX, glowY],
                ([gx, gy]) =>
                  `radial-gradient(320px circle at ${gx}% ${gy}%, rgba(91,138,245,0.10) 0%, transparent 65%)`
              ),
              transition: "opacity 300ms ease",
              pointerEvents: "none",
            }}
          />

          {/* Top rule with index */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                height: "1px",
                flex: 1,
                background:
                  "linear-gradient(90deg, rgba(91,138,245,0.5) 0%, rgba(91,138,245,0.05) 100%)",
              }}
            />
            <span
              style={{
                marginLeft: "12px",
                fontFamily: "'DM Mono', 'Fira Mono', monospace",
                fontSize: "10px",
                letterSpacing: "0.12em",
                color: "rgba(91,138,245,0.65)",
                fontWeight: 500,
              }}
            >
              {member.index}
            </span>
          </div>

          {/* Avatar */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "22px" }}>
            <div
              style={{
                position: "relative",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                padding: "2px",
                background: hovered
                  ? `conic-gradient(from 180deg, ${member.accent}, #1e3a8a, ${member.accent})`
                  : "rgba(255,255,255,0.08)",
                transition: "background 400ms ease",
              }}
            >
              {/* Spin ring on hover */}
              {hovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  transition={{
                    opacity: { duration: 0.2 },
                    rotate: { repeat: Infinity, duration: 4, ease: "linear" },
                  }}
                  style={{
                    position: "absolute",
                    inset: "-3px",
                    borderRadius: "50%",
                    background: `conic-gradient(from 0deg, transparent 60%, ${member.accent} 100%)`,
                    zIndex: 0,
                  }}
                />
              )}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "#0d0d14",
                  zIndex: 1,
                }}
              >
                <Image
                  src={member.image}
                  alt={`${member.firstName} ${member.lastName}`}
                  fill
                  sizes="100px"
                  style={{
                    objectFit: "cover",
                    objectPosition: (member as any).objectPosition || "center",
                    filter: hovered
                      ? "saturate(1.1) brightness(1.05)"
                      : "saturate(0.6) brightness(0.85)",
                    transition: "filter 400ms ease",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Name */}
          <div
            style={{
              textAlign: "center",
              fontFamily: "'Sora', 'DM Sans', sans-serif",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontSize: "17px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#f0f0f2",
              }}
            >
              {member.firstName}{" "}
            </span>
            <span
              style={{
                fontSize: "17px",
                fontWeight: 300,
                letterSpacing: "-0.01em",
                color: "rgba(255,255,255,0.28)",
                fontStyle: "italic",
              }}
            >
              {member.lastName}
            </span>
          </div>

          {/* Role */}
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.3)",
              fontWeight: 400,
            }}
          >
            {member.role}
          </div>

          {/* Bottom accent bar */}
          <motion.div
            animate={{ scaleX: hovered ? 1 : 0.1, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginTop: "20px",
              height: "2px",
              borderRadius: "2px",
              background: `linear-gradient(90deg, transparent, ${member.accent}, transparent)`,
              transformOrigin: "center",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Section ───────────────────────────────────────────────────────── */
export function TeamSection() {
  return (
    <section
      id="team"
      style={{
        position: "relative",
        padding: "140px 0 160px",
        background: `#08080a`,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
      }}
    >
      {/* Deep ambient glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(91,138,245,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* Noise grain overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.028'/%3E%3C/svg%3E")`,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      <div
        className="relative z-10 w-full"
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px" }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <div style={{ height: "1px", width: "40px", background: "rgba(91,138,245,0.4)" }} />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: "#5b8af5",
              textTransform: "uppercase",
            }}
          >
            The Minds Behind
          </span>
          <div style={{ height: "1px", width: "40px", background: "rgba(91,138,245,0.4)" }} />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(48px, 6vw, 72px)",
            letterSpacing: "-0.03em",
            textAlign: "center",
            margin: "0 0 8px",
            lineHeight: 1.05,
          }}
        >
          <span style={{ fontWeight: 700, color: "white" }}>Team </span>
          <span
            style={{
              color: "#5b8af5",
              fontStyle: "italic",
              fontWeight: 300,
            }}
          >
            ZerothLayer
          </span>
        </motion.h2>

        {/* Sub-tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15 }}
          style={{
            textAlign: "center",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            color: "rgba(255,255,255,0.28)",
            letterSpacing: "0.01em",
            marginBottom: "72px",
          }}
        >
          Four engineers. One obsession.
        </motion.p>

        {/* Card grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
          className="sm:grid-cols-2 xs:grid-cols-1"
        >
          {members.map((member, i) => (
            <MemberCard key={member.firstName} member={member} i={i} />
          ))}
        </div>

        {/* Footer rule */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginTop: "72px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(91,138,245,0.25) 30%, rgba(91,138,245,0.25) 70%, transparent 100%)",
            transformOrigin: "center",
          }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7 }}
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px",
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.14)",
            textTransform: "uppercase",
          }}
        >
          R.C. Patel Institute of Technology · Shirpur
        </motion.p>
      </div>
    </section>
  );
}