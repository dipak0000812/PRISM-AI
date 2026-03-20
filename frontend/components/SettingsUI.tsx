"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export function InputGroup({ label, value, type = "text" }: { label: string, value: string, type?: string }) {
    return (
        <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-0.5">{label}</label>
            <input 
                type={type} 
                defaultValue={value} 
                className="w-full px-5 py-3.5 bg-zinc-900/30 border border-zinc-800/80 rounded-xl text-sm font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900/50 transition-all duration-200" 
            />
        </div>
    );
}

export function Toggle({ enabled = false }: { enabled?: boolean }) {
    return (
        <div className={`w-10 h-5.5 rounded-full relative p-1 transition-all duration-300 ${enabled ? "bg-indigo-500" : "bg-zinc-800"}`}>
            <motion.div 
                animate={{ x: enabled ? 18 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" 
            />
        </div>
    );
}

export function ToggleItem({ title, desc, enabled = false }: { title: string, desc: string, enabled?: boolean }) {
    return (
        <div className="flex items-center justify-between py-6 border-b border-zinc-900/50 last:border-0 group cursor-pointer">
             <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{title}</span>
                <span className="text-xs text-zinc-500 font-medium tracking-tight leading-relaxed">{desc}</span>
             </div>
             <Toggle enabled={enabled} />
        </div>
    );
}

export function NotificationItem({ icon: Icon, label, desc, enabled }: { icon: LucideIcon, label: string, desc: string, enabled: boolean }) {
    return (
        <div className="flex items-center justify-between py-6 border-b border-zinc-900/50 last:border-0 group">
            <div className="flex items-center gap-5">
                <div className="p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl group-hover:border-zinc-700 transition-colors">
                    <Icon className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{label}</span>
                    <span className="text-[11px] text-zinc-500 font-medium whitespace-pre-wrap max-w-[320px] leading-relaxed">{desc}</span>
                </div>
            </div>
            <Toggle enabled={enabled} />
        </div>
    );
}
