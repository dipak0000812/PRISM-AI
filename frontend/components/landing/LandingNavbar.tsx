"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BarChart2, Zap, ShieldAlert, GitMerge, FileText, Database } from "lucide-react";
import { useSession } from "next-auth/react";

// The menu content structure
const NAV_ITEMS = [
  {
    label: "Features",
    dropdown: {
      type: "features",
      main: [
        { title: "Risk Analysis", desc: "Automated scoring based on blast radius", icon: ShieldAlert, href: "#features" },
        { title: "AI Summaries", desc: "LLM-generated code explanations", icon: Zap, href: "#features" },
        { title: "Dashboard", desc: "Real-time overview of repository health", icon: BarChart2, href: "/dashboard" },
      ],
      side: [
        { title: "Live Feed", href: "/mr", icon: GitMerge },
        { title: "Data Model", href: "/dashboard", icon: Database },
      ]
    }
  },
  {
    label: "Company",
    dropdown: {
      type: "simple",
      links: [
        { title: "About Us", href: "#" },
        { title: "Blog", href: "#" },
        { title: "Careers", href: "#" },
        { title: "Contact", href: "#" },
      ]
    }
  },
  {
    label: "Resources",
    dropdown: {
      type: "simple",
      links: [
        { title: "Documentation", href: "#" },
        { title: "API Reference", href: "#", icon: FileText },
        { title: "Community", href: "#" },
      ]
    }
  },
  { label: "Pricing", href: "#" },
];

export function LandingNavbar() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  let timeoutId: NodeJS.Timeout;
  const logoHref = session ? '/dashboard' : '/';

  const handleMouseEnter = (label: string) => {
    clearTimeout(timeoutId);
    setActiveTab(label);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => {
      setActiveTab(null);
    }, 150);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-14"
      style={{
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <Link href={logoHref} className="flex items-center gap-2 group shrink-0">
        <span className="text-white text-lg font-semibold tracking-tight">
          <span className="text-indigo-400">◈</span> PRISM
        </span>
      </Link>

      {/* Center Nav links with Dropdowns */}
      <div 
        className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 h-full"
        onMouseLeave={handleMouseLeave}
      >
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            className="relative flex items-center h-full px-4"
            onMouseEnter={() => handleMouseEnter(item.label)}
          >
            {item.href ? (
              <Link
                href={item.href}
                className="text-[13px] text-zinc-400 hover:text-white transition-colors duration-150"
              >
                {item.label}
              </Link>
            ) : (
              <button
                className={`flex items-center gap-1 text-[13px] transition-colors duration-150 ${
                  activeTab === item.label ? "text-white" : "text-zinc-400"
                }`}
              >
                {item.label}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeTab === item.label ? 'rotate-180' : ''}`} />
              </button>
            )}

            {/* Dropdown Palette */}
            <AnimatePresence>
              {activeTab === item.label && item.dropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-[56px] left-1/2 -translate-x-1/2 p-2 rounded-2xl bg-[#0c0c0e] border border-zinc-800 shadow-2xl overflow-hidden"
                  style={{ minWidth: item.dropdown.type === "features" ? 520 : 200 }}
                >
                  {/* Features style mega menu */}
                  {item.dropdown.type === "features" && (
                    <div className="flex gap-2">
                      <div className="flex-1 flex flex-col gap-1 p-2">
                        {item.dropdown.main?.map((link) => (
                          <Link
                            key={link.title}
                            href={link.href}
                            className="flex items-start gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors group/link"
                          >
                            <div className="mt-0.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover/link:text-white group-hover/link:bg-zinc-800 transition-all">
                              <link.icon className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-medium text-zinc-200 group-hover/link:text-white flex items-center justify-between">
                                {link.title}
                                <span className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all font-mono text-[10px] text-zinc-500">→</span>
                              </span>
                              <span className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed">{link.desc}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="w-[180px] bg-zinc-900/40 rounded-xl border border-zinc-800/50 p-4 flex flex-col gap-3">
                        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Capabilities</span>
                        {item.dropdown.side?.map((link) => (
                          <Link
                            key={link.title}
                            href={link.href}
                            className="flex items-center gap-3 text-[13px] text-zinc-400 hover:text-white transition-colors group/side"
                          >
                            <link.icon className="w-3.5 h-3.5 opacity-50 group-hover/side:opacity-100 transition-opacity" />
                            {link.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Simple list menu */}
                  {item.dropdown.type === "simple" && (
                    <div className="flex flex-col p-1">
                      {item.dropdown.links?.map((link) => (
                        <Link
                          key={link.title}
                          href={link.href}
                          className="flex items-center justify-between px-3 py-2 text-[13px] text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors group/link"
                        >
                          <span className="flex items-center gap-2">
                            {link.icon && <link.icon className="w-3.5 h-3.5 opacity-50" />}
                            {link.title}
                          </span>
                          <span className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all font-mono text-[10px] text-zinc-500">→</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Right side CTAs */}
      <div className="hidden md:flex items-center gap-5 shrink-0">
        {status === "loading" ? (
          <div className="w-24 h-8 bg-white/5 rounded animate-pulse" />
        ) : session ? (
          <Link href="/dashboard" className="text-[13px] font-medium text-white hover:text-indigo-300 transition-colors">
            Go to Dashboard →
          </Link>
        ) : (
          <>
            <Link href="/login" className="text-[13px] text-zinc-400 hover:text-white transition-colors">
              Log In
            </Link>
            <Link href="/login">
              <button
                className="px-4 py-2 rounded-full text-[13px] font-medium text-black bg-white hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
                style={{ boxShadow: "0 0 20px rgba(255,255,255,0.15)" }}
              >
                Get Started
              </button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button className="md:hidden text-[#a1a1aa] hover:text-white transition-colors shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </motion.nav>
  );
}
