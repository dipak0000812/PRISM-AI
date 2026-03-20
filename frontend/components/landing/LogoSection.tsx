"use client";

import { motion } from "framer-motion";

const LOGOS = [
  { name: "Acme Corp", icon: "ACME" },
  { name: "Global Systems", icon: "GLOBAL" },
  { name: "Pulse Tech", icon: "PULSE" },
  { name: "Apex Design", icon: "APEX" },
  { name: "Nova AI", icon: "NOVA" },
  { name: "Stratis", icon: "STRATIS" },
  { name: "Echo Labs", icon: "ECHO" },
  { name: "Vertex", icon: "VERTEX" },
];

export function LogoSection() {
  return (
    <section className="py-24 border-y border-zinc-900 bg-zinc-950/20">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-16 italic">
          Trusted by modern engineering teams
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-x-12 gap-y-16 items-center place-items-center opacity-40 grayscale group-hover:grayscale-0 transition-all">
          {LOGOS.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group cursor-pointer hover:opacity-100 transition-opacity"
            >
              <span className="text-sm font-black tracking-widest text-white group-hover:text-indigo-400">
                {logo.icon}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
