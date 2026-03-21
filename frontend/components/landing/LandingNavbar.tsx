"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#showcase" },
  { label: "Log in", href: "/login" },
];

export function LandingNavbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-14"
      style={{
        background: "rgba(8,8,10,0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <span className="text-white text-lg font-semibold tracking-tight">
          <span className="text-indigo-400">◈</span> PRISM
        </span>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="relative text-[13px] text-[#a1a1aa] hover:text-white transition-colors duration-150 group"
          >
            {link.label}
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white transition-all duration-200 group-hover:w-full" />
          </Link>
        ))}
        <Link href="/dashboard">
          <button
            className="px-4 py-2 rounded-md text-[13px] font-medium text-black bg-white hover:bg-zinc-100 transition-all active:scale-[0.98] duration-150"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
          >
            View Dashboard →
          </button>
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button className="md:hidden text-[#a1a1aa] hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </motion.nav>
  );
}
