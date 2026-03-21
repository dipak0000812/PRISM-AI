"use client";

import Link from "next/link";
import { Github } from "lucide-react";

const LINKS = {
  Product: ["Features", "Integrations", "Changelog", "Pricing"],
  Resources: ["Documentation", "API Reference", "Community", "Status"],
  Team: ["About Us", "Blog", "GitLab Hackathon", "Open Source"],
};

export function Footer() {
  return (
    <footer
      className="px-8 md:px-16 pt-20 pb-10"
      style={{ borderTop: "1px solid #1f1f24" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-16">
          {/* Brand */}
          <div className="flex flex-col gap-5 max-w-xs">
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 text-lg">◈</span>
              <span className="text-white font-semibold tracking-tight">PRISM</span>
            </div>
            <p className="text-[14px] leading-[1.7]" style={{ color: "#71717a" }}>
              Autonomous risk intelligence for GitLab merge requests. Built for the GitLab AI
              Hackathon 2026.
            </p>
            <Link
              href="https://gitlab.com/Dipak_09/prism-ai"
              target="_blank"
              className="flex items-center gap-2 text-[13px] hover:text-white transition-colors duration-150"
              style={{ color: "#52525b" }}
            >
              <Github className="w-3.5 h-3.5" />
              View on GitLab
            </Link>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-3 gap-12">
            {Object.entries(LINKS).map(([section, items]) => (
              <div key={section} className="flex flex-col gap-5">
                <h4
                  className="text-[12px] font-medium"
                  style={{ color: "#ffffff" }}
                >
                  {section}
                </h4>
                <div className="flex flex-col gap-3.5">
                  {items.map((item) => (
                    <Link
                      key={item}
                      href="#"
                      className="text-[14px] hover:text-white transition-colors duration-150"
                      style={{ color: "#71717a" }}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid #1f1f24" }}
        >
          <p className="text-[13px]" style={{ color: "#52525b" }}>
            Built by Tech_Exchangers · GitLab AI Hackathon 2026
          </p>
          <p className="text-[13px]" style={{ color: "#52525b" }}>
            © 2026 PRISM · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
