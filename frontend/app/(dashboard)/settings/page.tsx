"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Shield, Github, User, Save, Code, Zap, Mail, Slack, Lock, Globe, Key, Trash2 } from "lucide-react";
import { InputGroup, ToggleItem, NotificationItem, Toggle } from "@/components/SettingsUI";

type SettingTab = "account" | "notifications" | "thresholds" | "gitlab" | "analysis";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>("account");
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: "account", icon: User, label: "Account & Profile" },
    { id: "notifications", icon: Bell, label: "Notification Rules" },
    { id: "thresholds", icon: Shield, label: "Risk Thresholds" },
    { id: "gitlab", icon: Github, label: "GitLab Integration" },
    { id: "analysis", icon: Code, label: "Analysis Configuration" }
  ] as const;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 2000);
  };

  return (
    <div className="flex flex-col gap-12 pb-20 max-w-7xl mx-auto w-full">
      {/* Header section - Matching Dashboard Style */}
      <div className="flex flex-col gap-3">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="flex items-center gap-2.5"
         >
           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
             System Configuration
           </span>
         </motion.div>
         
         <div className="flex items-end justify-between border-b border-zinc-900/50 pb-8">
           <div className="flex flex-col gap-1.5">
             <motion.h1
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-5xl font-black tracking-tighter text-white"
             >
               Settings
             </motion.h1>
             <p className="text-sm text-zinc-500 font-medium tracking-tight">
               Manage your operational parameters, security thresholds, and workspace integrations.
             </p>
           </div>
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="text-[11px] font-bold text-zinc-600 mb-2 uppercase tracking-widest italic"
           >
             Verified Session
           </motion.div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mt-4">
          {/* Settings Sidebar - More Minimal */}
          <div className="lg:col-span-1 flex flex-col gap-1">
              {tabs.map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3.5 px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 group relative ${
                        activeTab === tab.id
                        ? "text-white bg-zinc-900/40" 
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"
                    }`}
                >
                    <tab.icon className={`w-4 h-4 transition-all ${activeTab === tab.id ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400"}`} /> 
                    {tab.label}
                    {activeTab === tab.id && (
                        <motion.div 
                            layoutId="active-pill"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-full"
                        />
                    )}
                </button>
              ))}
          </div>

          {/* Settings Content Area - Section-based layout */}
          <div className="lg:col-span-3 flex flex-col gap-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-12"
                >
                    {/* Tab-Specific Content */}
                    {activeTab === "account" && (
                        <div className="flex flex-col gap-12">
                            <section className="flex flex-col gap-10">
                                <div className="flex items-center gap-8">
                                    <div className="w-24 h-24 rounded-[32px] bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl font-black text-indigo-500 shadow-inner group cursor-pointer overflow-hidden relative">
                                        <User className="w-10 h-10 text-white opacity-20 group-hover:opacity-100 transition-opacity absolute" />
                                        JD
                                        <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase">John Dorian</h3>
                                        <p className="text-sm text-zinc-500 font-medium">Principal Security Engineer • <span className="text-indigo-400 font-bold italic">Administrator</span></p>
                                        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors mt-2 text-left">Update Profile Photo</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                    <InputGroup label="Display Name" value="John Dorian" />
                                    <InputGroup label="Email Address" value="john@prism-ai.com" type="email" />
                                    <InputGroup label="Working Title" value="Principal Security Engineer" />
                                    <InputGroup label="Region / Timezone" value="San Francisco, US (UTC-8)" />
                                </div>
                            </section>

                            <section className="flex flex-col gap-6 pt-12 border-t border-zinc-900/80">
                                <div className="flex flex-col gap-1.5">
                                    <h4 className="text-[11px] font-black uppercase text-indigo-400 tracking-[0.25em]">Security & Identity</h4>
                                    <p className="text-xs text-zinc-500 font-medium tracking-tight">Protect your session and manage platform access.</p>
                                </div>
                                <div className="divide-y divide-zinc-900/50">
                                    <div className="flex items-center justify-between py-6 group">
                                        <div className="flex items-center gap-5">
                                            <div className="p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                                                <Lock className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-bold text-zinc-200">Two-Factor Authentication</span>
                                                <span className="text-[11px] text-zinc-500 font-medium leading-relaxed">Secure your account with a mobile authenticator app.</span>
                                            </div>
                                        </div>
                                        <Toggle enabled={true} />
                                    </div>
                                    <div className="flex items-center justify-between py-6 group">
                                        <div className="flex items-center gap-5">
                                            <div className="p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                                                <Key className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-bold text-zinc-200">API Access Key</span>
                                                <span className="text-[11px] text-zinc-500 font-mono leading-relaxed opacity-60">sk_prism_8293...x82z</span>
                                            </div>
                                        </div>
                                        <button className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] font-black text-zinc-400 hover:text-white transition-all uppercase tracking-widest">Rotate Key</button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="flex flex-col gap-12">
                            <section className="flex flex-col gap-2">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Event Broadcasting</h3>
                                <p className="text-sm text-zinc-500 font-medium tracking-tight">Configure where intelligence findings are delivered.</p>
                            </section>
                            
                            <section className="flex flex-col gap-2">
                                <NotificationItem 
                                    icon={Slack} 
                                    label="Slack Integration" 
                                    desc="Deliver real-time high-risk analysis findings to the secure #security-intel channel." 
                                    enabled={true} 
                                />
                                <NotificationItem 
                                    icon={Mail} 
                                    label="Security Digest" 
                                    desc="Receive a prioritized daily report of anomalous repository activity and transitive risk escalations." 
                                    enabled={false} 
                                />
                                <NotificationItem 
                                    icon={Bell} 
                                    label="In-Platform Notifications" 
                                    desc="Active desktop and browser alerts for current forensic scanning cycles." 
                                    enabled={true} 
                                />
                            </section>

                            <section className="flex flex-col gap-6 pt-12 border-t border-zinc-900/80">
                                <div className="flex flex-col gap-1.5">
                                    <h4 className="text-[11px] font-black uppercase text-indigo-400 tracking-[0.25em]">Webhook Configuration</h4>
                                    <p className="text-xs text-zinc-500 font-medium tracking-tight">Manual endpoint for third-party intelligence ingestors.</p>
                                </div>
                                <div className="max-w-2xl">
                                    <InputGroup label="Slack Endpoint Variable" value="REPLACE_WITH_SLACK_WEBHOOK_URL" />
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === "thresholds" && (
                        <div className="flex flex-col gap-12">
                            <section className="flex items-center justify-between border-b border-zinc-900 pb-8">
                                <div className="flex flex-col gap-1.5">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Risk Intelligence Calibration</h3>
                                    <p className="text-sm text-zinc-500 font-medium tracking-tight">Tune the sensitivity and scoring parameters of the PRISM forensic engine.</p>
                                </div>
                                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                                    <Zap className="w-7 h-7 text-indigo-500" />
                                </div>
                            </section>

                            <section className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <InputGroup label="High Risk Detection Floor" value="75%" />
                                <InputGroup label="Critical Escalation Level" value="92%" />
                                <InputGroup label="Dependency Churn Penalty" value="12.5%" />
                                <InputGroup label="Forensic Cycle Timeout" value="90s" />
                            </section>

                            <section className="flex flex-col gap-2 pt-12 border-t border-zinc-900/80">
                                <ToggleItem 
                                    title="Aggressive Scanning Mode" 
                                    desc="Automatically flag any modifications to core authentication or authorization modules as high risk regardless of impact volume." 
                                    enabled={true} 
                                />
                                <ToggleItem 
                                    title="Predictive Blast Radius" 
                                    desc="Use static analysis and history to forecast potential transitive side effects in downstream modules before merge." 
                                    enabled={false} 
                                />
                            </section>
                        </div>
                    )}

                    {activeTab === "gitlab" && (
                         <div className="flex flex-col gap-12">
                            <section className="flex flex-col gap-2">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">SCM Data Node</h3>
                                <p className="text-sm text-zinc-500 font-medium tracking-tight">Synchronize repository events from your internal GitLab instance.</p>
                            </section>

                            <section className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <InputGroup label="External GitLab URL" value="https://gitlab.internal.enterprise" />
                                <InputGroup label="Connected Namespace" value="infra-core / monolith" />
                            </section>

                            <section className="p-10 bg-zinc-900/20 border border-zinc-900 rounded-[32px] flex flex-col items-center justify-center gap-6 text-center mt-4">
                                <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-[20px] relative shadow-2xl">
                                     <Github className="w-10 h-10 text-white opacity-40" />
                                     <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-4 border-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-black text-white uppercase tracking-[0.15em]">Connector Operational</span>
                                    <span className="text-[11px] text-zinc-600 font-medium">Last successful heartbeat: 4m 12s ago</span>
                                </div>
                                <button className="px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95">Disconnect Repository Node</button>
                            </section>
                         </div>
                    )}

                    {activeTab === "analysis" && (
                        <div className="flex flex-col gap-12">
                             <section className="flex flex-col gap-2">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Engine Runtime Configuration</h3>
                                <p className="text-sm text-zinc-500 font-medium tracking-tight">Optimize forensic resource allocation and scanning depths.</p>
                            </section>

                            <section className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <InputGroup label="Transitive Scan Depth" value="8 Hops" />
                                <InputGroup label="Parallel Worker Threads" value="16 Workers" />
                                <InputGroup label="Memory Budget (Soft Limit)" value="4096 MB" />
                                <InputGroup label="Log Verbosity Level" value="Information" />
                            </section>

                            <section className="flex flex-col gap-2 pt-12 border-t border-zinc-900/80">
                                <ToggleItem 
                                    title="Background Pre-calculation" 
                                    desc="Proactively rebuild blast radius maps in the background to improve query performance during live MR reviews." 
                                    enabled={true} 
                                />
                                <div className="flex items-center justify-between py-8 border-t border-zinc-900/50 mt-4 group">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl group-hover:border-red-500/30 transition-colors">
                                            <Trash2 className="w-5 h-5 text-red-500 group-hover:animate-shake" />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-bold text-red-200">Re-index Repository Metadata</span>
                                            <span className="text-[11px] text-zinc-600 font-medium leading-relaxed">Force a full purge of all dependency maps and rebuild from source.</span>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95">Purge & Rebuild</button>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Form Actions - Matching Refresh Data Button */}
                    <div className="flex justify-end items-center gap-8 pt-12 border-t border-zinc-900/80 mt-8">
                         <motion.span 
                            initial={false}
                            animate={{ opacity: isSaving ? 1 : 0 }}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400"
                         >
                             Syncing configurations...
                         </motion.span>
                         <button className="text-[11px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">
                             Discard Changes
                         </button>
                         <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`group flex items-center gap-3 px-10 py-5 text-[12px] font-black uppercase tracking-[0.15em] rounded-2xl transition-all active:scale-95 ${
                                isSaving 
                                ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" 
                                : "bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] shadow-[0_10px_40px_rgba(255,255,255,0.1)]"
                            }`}
                         >
                              <Save className={`w-4 h-4 transition-transform duration-500 ${isSaving ? "animate-spin" : "group-hover:translate-x-0.5"}`} /> 
                              {isSaving ? "Processing" : "Update System Config"}
                         </button>
                    </div>
                </motion.div>
              </AnimatePresence>

              {/* Deployment Info Card - Minimal Version */}
              <div className="p-8 border border-zinc-900 rounded-[32px] bg-zinc-900/10 flex items-center justify-between group overflow-hidden relative">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl transition-all duration-500 group-hover:bg-zinc-800">
                        <Globe className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em]">Cloud Infrastructure</h4>
                        <p className="text-sm font-bold text-white tracking-tight leading-none mt-1">Maintenance Node: <span className="text-indigo-400">US-WEST-CENTRAL</span> (Production)</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 px-4 border-l border-zinc-900">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                      <span className="text-[10px] text-zinc-600 font-medium">Lat-92ms</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Atmospheric Background Layering */}
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <div className="absolute top-[30%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-5%] w-[35%] h-[35%] bg-zinc-800/10 blur-[130px] rounded-full" />
      </div>
    </div>
  );
}
