"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Youtube, Activity } from "lucide-react";
import { motion } from "framer-motion";

const LINKS = {
  Features: ["Risk Analysis", "Blast Radius", "AI Summaries", "Dashboard", "CI/CD Integration", "Webhooks"],
  Resources: ["Changelog", "Pricing", "Security", "SOC 2", "GDPR", "Brand"],
  Company: ["About", "Blog", "Careers", "Customers", "Humans", "Philosophy"],
  Help: ["Contact", "Support", "Status", "Migrate", "Knowledge Base", "Legal Policies"],
  Community: ["Events", "Insiders", "Open Source", "Wallpapers"],
};

export function Footer() {
  return (
    <footer className="px-8 md:px-16 pt-24 pb-12 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-24">
          
          {/* Left Column - Address, Socials, Status */}
          <div className="flex flex-col gap-8 max-w-[240px]">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-white text-xl font-semibold tracking-tight">
                <span className="text-indigo-400">◈</span> PRISM
              </span>
            </Link>

            <div className="text-[14px] text-zinc-500 leading-[1.6]">
              SF Hackers Space<br />
              San Francisco, CA 94103
            </div>

            <div className="flex items-center gap-3">
              {[Twitter, Github, Linkedin, Youtube].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>

            <Link href="#" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 transition-colors w-max">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-[12px] font-medium text-zinc-300">All systems operational</span>
            </Link>
          </div>

          {/* Right Columns - Links */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-12">
            {Object.entries(LINKS).map(([section, items]) => (
              <div key={section} className="flex flex-col gap-6">
                <h4 className="text-[14px] font-medium text-white">
                  {section}
                </h4>
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <Link
                      key={item}
                      href="#"
                      className="text-[14px] text-zinc-400 hover:text-white transition-colors duration-150"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
