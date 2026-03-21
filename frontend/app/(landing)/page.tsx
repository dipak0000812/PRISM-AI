"use client";

import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Hero } from "@/components/landing/Hero";
import { LogoSection } from "@/components/landing/LogoSection";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { Showcase } from "@/components/landing/Showcase";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { 
  Shield, Zap, Search, Globe, 
  ShieldCheck, GitPullRequest, GitCommit 
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen text-white selection:bg-white selection:text-black scroll-smooth"
      style={{
        background: "#08080a",
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(91,138,245,0.15), transparent),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")
        `,
      }}
    >
      <LandingNavbar />
      
      <main>
        <Hero />
        
        <LogoSection />

        <div id="features" className="scroll-mt-24">
          {/* Section 1: Forensic Analysis */}
          <FeatureSection
            badge="Forensic Analysis"
            title="Understand risk at scale"
            description="Our advanced intelligence engine analyzes every code modification, identifying transitive dependencies and potential attack vectors before they reach production."
            icon={Shield}
          >
            <div className="relative group/card transition-all duration-700 hover:scale-[1.02]">
               <div className="absolute -inset-1 bg-linear-to-r from-indigo-500/20 to-transparent blur-3xl opacity-50 -z-10" />
               <div className="p-8 bg-zinc-900/40 border border-white/10 rounded-[32px] md:rounded-[40px] aspect-video flex flex-col gap-6 backdrop-blur-3xl shadow-2xl">
                  {/* Mac Window Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-6 whitespace-nowrap overflow-hidden">
                     <div className="flex gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-lg shadow-red-500/20" />
                        <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-lg shadow-yellow-500/20" />
                        <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-lg shadow-green-500/20" />
                     </div>
                     <div className="px-3.5 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-[9px] font-black uppercase text-red-500 tracking-[0.15em] shrink-0 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        3 Critical Threats
                     </div>
                  </div>

                  <div className="flex-1 space-y-4 pt-2">
                     {[
                        { title: "Auth Bypass Node", sub: "package-json", badge: "Critical", color: "text-red-400", bg: "bg-red-500/10" },
                        { title: "Data Leak Pattern", sub: "api-v1-users", badge: "High", color: "text-orange-400", bg: "bg-orange-500/10" },
                        { title: "Logic Flow Invert", sub: "auth-strategy", badge: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/10" },
                        { title: "Dependency Risk", sub: "lodash-v4", badge: "Low", color: "text-green-400", bg: "bg-green-500/10" }
                     ].map((item, i) => (
                        <div key={i} className="group/row flex items-center justify-between p-4 bg-zinc-950/40 border border-white/5 rounded-2xl hover:bg-white/5 transition-all duration-300">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center group-hover/row:border-white/20 transition-colors">
                                 <Shield className="w-5 h-5 text-zinc-500 group-hover/row:text-zinc-300 transition-colors" strokeWidth={1.5} />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-[13px] font-black text-white tracking-tight">{item.title}</span>
                                 <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{item.sub}</span>
                              </div>
                           </div>
                           <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${item.bg} ${item.color}`}>
                              {item.badge}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </FeatureSection>

          {/* Section 2: Autonomous Intelligence */}
          <FeatureSection
            badge="Autonomous Intelligence"
            title="AI-powered forensic insights"
            description="Go beyond basic security scans. PRISM leverages custom-trained models to detect sophisticated anomalies, logic flaws, and supply chain vulnerabilities in real-time."
            icon={Zap}
            reverse
          >
             <div className="relative group/ai transition-all duration-1000">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 blur-[100px] -z-10 opacity-50" />
               <div className="grid grid-cols-2 gap-5">
                  <motion.div 
                    initial={{ y: 0 }}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="col-span-2 p-12 bg-indigo-500/5 border border-indigo-500/10 rounded-[40px] flex flex-col gap-6 items-center justify-center backdrop-blur-3xl relative overflow-hidden group/top hover:bg-indigo-500/10 transition-all duration-500 hover:border-indigo-500/20"
                  >
                     <div className="absolute inset-0 bg-linear-to-b from-indigo-500/10 to-transparent opacity-0 group-hover/top:opacity-100 transition-opacity" />
                     <motion.div 
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-400 to-transparent opacity-30 z-20"
                     />
                     
                     <div className="relative w-24 h-24 mb-2">
                        <Zap className="w-full h-full text-indigo-400 absolute inset-0 blur-2xl opacity-40 animate-pulse" />
                        <Zap className="w-full h-full text-white relative z-10" />
                     </div>
                     <div className="flex flex-col items-center gap-2">
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400">Deep Scan Active</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Scanning repository for vulnerabilities...</p>
                     </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                    className="p-6 bg-black/40 border border-white/5 rounded-3xl flex flex-col gap-4 backdrop-blur-md transition-all duration-300 group/threat"
                  >
                     <div className="flex items-center justify-between">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                           <Search className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-[8px] font-black text-red-500 tracking-widest">CRITICAL</div>
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <h4 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                           Recent Threat
                        </h4>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-zinc-400">auth-service</span>
                           <span className="text-[9px] font-medium text-zinc-600 italic">middleware/auth.ts</span>
                        </div>
                     </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                    className="p-6 bg-zinc-900/40 border border-white/5 rounded-3xl flex flex-col gap-4 backdrop-blur-md transition-all duration-300 group/insight"
                  >
                     <div className="flex items-center justify-between">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                           <Globe className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="text-[9px] font-black text-indigo-400 tracking-widest">92% CONFIDENCE</div>
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <h4 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                           AI Insight
                        </h4>
                        <p className="text-[10px] font-medium text-zinc-500 leading-tight">
                           Potential Auth bypass vulnerability detected via transitive dependency.
                        </p>
                     </div>
                  </motion.div>
               </div>
            </div>
          </FeatureSection>

          {/* Section 3: Security Operations */}
          <FeatureSection
            badge="Security Operations"
            title="Ship faster with confidence"
            description="Integrate seamlessly into your CI/CD pipelines. Automate risk approvals and focus your elite talent on high-level architecture instead of chasing false positives."
            icon={Shield}
          >
             <div className="relative group/pipeline transition-all duration-1000">

               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 blur-[120px] -z-10 opacity-30" />

               <div className="relative p-10 bg-zinc-900/30 border border-white/10 rounded-[48px] overflow-hidden backdrop-blur-3xl shadow-2xl group-hover/pipeline:border-white/20 transition-all duration-500">
                  <div className="absolute top-8 left-8 flex flex-col gap-1">
                     <span className="text-[11px] font-black text-emerald-400">+42%</span>
                     <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Faster Reviews</span>
                  </div>
                  <div className="absolute bottom-8 right-8 flex flex-col items-end gap-1">
                     <span className="text-[11px] font-black text-indigo-400">↓ 67%</span>
                     <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest text-right">False Positives</span>
                  </div>

                  <div className="flex flex-col items-center gap-4 relative z-10 py-6 text-center">
                     {[
                        { label: "Git Push", icon: GitCommit, color: "text-zinc-500", bg: "bg-zinc-500/10" },
                        { label: "PR Created", icon: GitPullRequest, color: "text-blue-400", bg: "bg-blue-500/10" },
                        { label: "PRISM Scan", icon: Zap, color: "text-white", bg: "bg-indigo-600", isSpecial: true },
                        { label: "Risk Analysis", icon: Search, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                        { label: "Auto Approved", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" }
                     ].map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 w-full">
                           <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5, delay: i * 0.15 }}
                              className={`flex items-center gap-4 px-6 py-3 min-w-[200px] border border-white/5 rounded-2xl transition-all duration-300 ${step.bg} ${step.isSpecial ? 'shadow-[0_0_30px_rgba(99,102,241,0.5)] border-white/20 animate-pulse' : 'hover:bg-white/5 group-hover/pipeline:border-white/10'}`}
                           >
                              <step.icon className={`w-4 h-4 ${step.color}`} />
                              <span className={`text-[11px] font-black uppercase tracking-widest ${step.isSpecial ? 'text-white' : 'text-zinc-400'}`}>
                                 {step.label}
                                 {step.isSpecial && <span className="ml-2 animate-pulse">⚡</span>}
                              </span>
                           </motion.div>
                           
                           {i < 4 && (
                              <motion.div 
                                 initial={{ height: 0 }}
                                 whileInView={{ height: 16 }}
                                 viewport={{ once: true }}
                                 transition={{ duration: 0.3, delay: (i * 0.15) + 0.1 }}
                                 className="w-px bg-linear-to-b from-white/10 to-transparent"
                              />
                           )}
                        </div>
                     ))}

                     <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 1 }}
                        className="mt-8 flex items-center gap-6 px-4 py-2 bg-black/40 border border-white/5 rounded-full"
                     >
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                           <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Scan complete in 2.3s</span>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">0 critical issues</div>
                     </motion.div>
                  </div>
                </div>
             </div>
          </FeatureSection>
        </div>

        <Showcase />

        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
