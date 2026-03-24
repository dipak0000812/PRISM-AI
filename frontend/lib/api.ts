import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
})

export interface Analysis {
  id: number
  project_gitlab_id: number
  project_namespace: string
  mr_iid: number
  mr_title: string
  author_username: string
  risk_score: number
  risk_level: 'critical' | 'high' | 'medium' | 'low'
  blast_radius_size: number
  impact_depth: number
  lines_changed: number
  files_changed: number
  risk_breakdown: {
    pr_size?: { points: number; lines: number; signal: string }
    file_churn?: { points: number; max_churn: number; signal: string }
    core_module?: { points: number }
    test_coverage?: { points: number }
    dep_depth?: { points: number; depth: number; signal: string }
    author_exp?: { points: number; signal: string }
  }
  blast_radius_data: {
    directed: boolean
    nodes: Array<{ id: string; risk_level: string; is_changed: boolean; impact_depth?: number }>
    links: Array<{ source: string; target: string }>
  }
  ai_summary: string
  suggested_reviewers: Array<{ username: string; commit_count: number; modules: string[] }>
  source_branch: string
  created_at: string
}

export const getAnalyses = (): Promise<Analysis[]> =>
  api.get('/api/analyses').then((r) => r.data)

export const getAnalysis = (id: number): Promise<Analysis> =>
  api.get(`/api/analyses/${id}`).then((r) => r.data)

/** Convert ISO timestamp to "2h ago" style relative time */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
