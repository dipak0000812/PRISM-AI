"use client";

import Link from "next/link";
import { Shield, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-24 bg-black border-t border-zinc-900 px-8 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
        <div className="flex flex-col gap-6 max-w-xs">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-black" strokeWidth={3} />
             </div>
             <span className="text-xl font-bold tracking-tighter text-white uppercase">Prism</span>
          </div>
          <p className="text-sm font-medium text-zinc-600 leading-relaxed">
             Next-generation risk intelligence platform providing forensic analysis for modern engineering teams. Built with precision and speed.
          </p>
          <div className="flex items-center gap-4 mt-2">
             <Link href="#" className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all"><Github className="w-4 h-4" /></Link>
             <Link href="#" className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all"><Twitter className="w-4 h-4 fill-current" /></Link>
             <Link href="#" className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all"><Linkedin className="w-4 h-4" /></Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
          <div className="flex flex-col gap-6">
             <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Product</h4>
             <div className="flex flex-col gap-4">
                <Link href="#" className="text-sm font-bold text-zinc-600 hover:text-white transition-colors">Features</Link>
                <Link href="#" className="text-sm font-bold text-zinc-600 hover:text-white transition-colors">Integrations</Link>
                <Link href="#" className="text-sm font-bold text-zinc-600 hover:text-white transition-colors">Security</Link>
                <Link href="#" className="text-sm font-bold text-zinc-600 hover:text-white transition-colors">Pricing</Link>
             </div>
          </div>
          <div className="flex flex-col gap-6">
             <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Resources</h4>
             <div className="flex flex-col gap-4">
                <Link href="#" className="text-sm font-bold text-zinc-600 hover:text-white transition-colors">Documentation</Link>
                <Link href="#" className="text-sm font-bold text-zinc-600 hover:text-white transition-colors">API Reference</Link>
                <Link href="#" className="text-sm font-bold text-zinc-600 hover:text-white transition-colors">Community</Link>
                <Link href="#" className="text-sm font-bold text-zinc-600 hover:text-white transition-colors">Status</Link>
             </div>
          </div>
          <div className="flex flex-col gap-6">
             <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Company</h4>
             <div className="flex flex-col gap-4">
                <Link href="#" className="text-sm font-bold text-zinc-600 hover:text-white transition-colors">About Us</Link>
                <Link href="#" className="text-sm font-bold text-zinc-600 hover:text-white transition-colors">Blog</Link>
                <Link href="#" className="text-sm font-bold text-zinc-600 hover:text-white transition-colors">Careers</Link>
                <Link href="#" className="text-sm font-bold text-zinc-600 hover:text-white transition-colors">Privacy</Link>
             </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-6">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700">© 2026 PRISM INTELLIGENCE. ALL RIGHTS RESERVED.</p>
         <div className="flex items-center gap-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700 hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700 hover:text-white transition-colors cursor-pointer">Cookie Policy</span>
         </div>
      </div>
    </footer>
  );
}
