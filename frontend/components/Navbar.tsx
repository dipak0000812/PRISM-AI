"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, LayoutDashboard, GitMerge, Share2, Settings } from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Merge Requests", href: "/mr", icon: GitMerge },
  { name: "Graph Explorer", href: "/graph", icon: Share2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 bg-black/60 backdrop-blur-xl border-b border-zinc-900/80">
      <div className="flex items-center gap-4 group cursor-pointer">
        <div className="relative flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500">
          <Shield className="w-6 h-6 text-black" strokeWidth={2.5} />
          <div className="absolute inset-0 bg-white blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-black tracking-tight text-white uppercase leading-tight">Prism</span>
          <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.25em] -mt-0.5">
            Risk Intelligence
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative py-1 text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2.5 ${
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              <item.icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-zinc-600 group-hover:text-white"}`} />
              {item.name}
              
              {isActive && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">Monolith-API</span>
          <div className="flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
             <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Operational</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[11px] font-black text-white hover:border-zinc-700 transition-colors cursor-pointer shadow-inner">
          JD
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem("prism_auth");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Force hard redirect to ensure all states are cleared
            window.location.href = "/";
          }}
          className="text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

