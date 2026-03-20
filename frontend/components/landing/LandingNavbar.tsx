"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-6 border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="relative flex items-center justify-center w-9 h-9 bg-white rounded-lg shadow-2xl group-hover:scale-110 transition-transform duration-500">
          <Shield className="w-5 h-5 text-black" strokeWidth={3} />
        </div>
        <span className="text-xl font-bold tracking-tighter text-white uppercase">Prism</span>
      </div>

      <div className="hidden md:flex items-center gap-10">
        <Link href="#features" className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">Features</Link>
        <Link href="#pricing" className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">Pricing</Link>
        <Link href="/login" className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">Log in</Link>
        <Link href="/signup" className="px-5 py-2.5 bg-white text-black text-[13px] font-bold rounded-full hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/10">
          Sign up
        </Link>
      </div>

      <button className="md:hidden text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </nav>
  );
}
