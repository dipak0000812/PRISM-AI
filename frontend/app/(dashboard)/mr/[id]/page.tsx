"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, GitPullRequest, Clock, User, ShieldCheck, Activity } from "lucide-react";
import Link from "next/link";
import { RiskGauge } from "@/components/RiskGauge";
import { AISummaryCard } from "@/components/AISummaryCard";
import { BlastRadiusGraph } from "@/components/BlastRadiusGraph";
import { getAnalysis, relativeTime } from "@/lib/api";

const FACTOR_LABELS: Record<string, string> = {
  pr_size: "PR Size",
  file_churn: "File Churn",
  core_module: "Core Module",
  test_coverage: "Test Coverage",
  dep_depth: "Dep Depth",
  author_exp: "Author Experience",
};

function SkeletonBlock({ h = "h-32" }: { h?: string }) {
  return <div className={`animate-pulse bg-zinc-900/60 border border-zinc-900 rounded-2xl ${h} w-full`} />;
}

export default function MRDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: mr, isLoading } = useQuery({
    queryKey: ["analysis", id],
    queryFn: () => getAnalysis(Number(id)),
    enabled: !!id,
  });

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link href="/mr" className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Merge Requests
        </Link>
        {mr && (
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400">
              REF: {mr.source_branch}
            </div>
            <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              !{mr.mr_iid}
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-8">
          <SkeletonBlock h="h-20" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="flex flex-col gap-8">
              <SkeletonBlock h="h-56" />
              <SkeletonBlock h="h-40" />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-8">
              <SkeletonBlock h="h-48" />
              <SkeletonBlock h="h-80" />
            </div>
          </div>
        </div>
      ) : !mr ? (
        <div className="flex flex-col items-center gap-4 py-24 text-zinc-600">
          <Activity className="w-10 h-10 opacity-30" />
          <p className="text-sm font-medium">Analysis not found.</p>
        </div>
      ) : (
        <>
          {/* Hero Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <GitPullRequest className="w-5 h-5 text-black" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-white">{mr.mr_title}</h1>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <User className="w-4 h-4" />
                Authored by <span className="text-white ml-1">{mr.author_username}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <Clock className="w-4 h-4" />
                Analyzed {relativeTime(mr.created_at)}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verified by PRISM Agent
              </div>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: gauge + risk breakdown */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              <RiskGauge score={mr.risk_score} />

              {/* 6-factor breakdown */}
              <div className="flex flex-col gap-4 p-6 glass rounded-2xl border border-zinc-900">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Risk Breakdown (6 Factors)</h3>
                <div className="flex flex-col gap-3">
                  {Object.entries(mr.risk_breakdown).map(([key, factor]) => {
                    const pts = (factor as { points: number })?.points ?? 0;
                    return (
                      <div key={key} className="flex items-center justify-between gap-3">
                        <span className="text-xs text-zinc-400 font-medium">{FACTOR_LABELS[key] ?? key}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${Math.min(100, (pts / 30) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-black text-white tabular-nums w-6 text-right">{pts}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Suggested reviewers */}
              {mr.suggested_reviewers.length > 0 && (
                <div className="flex flex-col gap-4 p-6 glass rounded-2xl border border-zinc-900">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Suggested Reviewers</h3>
                  <div className="flex flex-col gap-3">
                    {mr.suggested_reviewers.map((r) => (
                      <div key={r.username} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[9px] font-black text-indigo-400">
                            {r.username[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs text-zinc-300 font-medium">@{r.username}</span>
                        </div>
                        <span className="text-[10px] text-zinc-600 font-bold">{r.commit_count} commits</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: AI summary + blast radius */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              <AISummaryCard
                delay={0.1}
                text={mr.ai_summary?.includes("unavailable")
                  ? "AI summary unavailable — Groq API key not configured."
                  : mr.ai_summary || "No AI summary generated yet."}
              />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-white">Blast Radius Visualization</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-tight">
                      AST-based dependency analysis · {mr.blast_radius_data?.nodes?.length ?? 0} nodes
                    </p>
                  </div>
                  <Link
                    href={`/graph?id=${mr.id}`}
                    className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800"
                  >
                    Full Screen Explorer
                  </Link>
                </div>

                {mr.blast_radius_data?.nodes?.length === 0 ? (
                  <div className="flex items-center justify-center h-60 glass rounded-2xl border border-zinc-900 text-zinc-600 text-sm">
                    No dependency graph data available
                  </div>
                ) : (
                  <BlastRadiusGraph data={mr.blast_radius_data} height={400} showMaximize={false} />
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Lines Changed", value: mr.lines_changed?.toLocaleString() ?? "—" },
                  { label: "Files Changed", value: mr.files_changed ?? "—" },
                  { label: "Blast Radius", value: mr.blast_radius_size ?? "—" },
                  { label: "Impact Depth", value: mr.impact_depth ?? "—" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col gap-1 p-4 glass rounded-xl border border-zinc-900 text-center">
                    <span className="text-xl font-black text-white">{s.value}</span>
                    <span className="text-[9px] text-zinc-600 uppercase tracking-widest">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
