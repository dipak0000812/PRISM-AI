import { RiskLevel } from "../components/RiskPill";
import { Node, Link } from "../components/BlastRadiusGraph";

export interface MOCK_MR {
  id: string;
  title: string;
  author: string;
  branch: string;
  riskScore: number;
  riskLevel: RiskLevel;
  updatedAt: string;
  graphData: { nodes: Node[]; links: Link[] };
}

export const MOCK_MRS: MOCK_MR[] = [
  {
    id: "mr-1204",
    title: "Update authentication middleware for multi-tenant support",
    author: "Alex Rivera",
    branch: "auth-refactor",
    riskScore: 82,
    riskLevel: "critical" as RiskLevel,
    updatedAt: "2h ago",
    graphData: {
      nodes: [
        { id: "auth.ts", name: "auth.ts", type: "file", risk: "critical", isDirectTarget: true },
        { id: "middleware.ts", name: "middleware.ts", type: "file", risk: "high" },
        { id: "user-service", name: "user-service", type: "service", risk: "medium" },
        { id: "db-client", name: "db-client", type: "module", risk: "low" },
        { id: "session-store", name: "session-store", type: "module", risk: "high" },
        { id: "api-gateway", name: "api-gateway", type: "service", risk: "critical" },
      ],
      links: [
        { source: "auth.ts", target: "middleware.ts", value: 5 },
        { source: "middleware.ts", target: "api-gateway", value: 3 },
        { source: "auth.ts", target: "user-service", value: 4 },
        { source: "user-service", target: "db-client", value: 2 },
        { source: "auth.ts", target: "session-store", value: 3 },
        { source: "session-store", target: "db-client", value: 1 },
      ],
    }
  },
  {
    id: "mr-1205",
    title: "Implement new dashboard analytics charts",
    author: "Casey Smith",
    branch: "feat-analytics",
    riskScore: 24,
    riskLevel: "low" as RiskLevel,
    updatedAt: "4h ago",
    graphData: {
      nodes: [
        { id: "analytics.tsx", name: "analytics.tsx", type: "file", risk: "low", isDirectTarget: true },
        { id: "chart-lib.js", name: "chart-lib.js", type: "module", risk: "low" },
        { id: "data-service", name: "data-service", type: "service", risk: "medium" },
      ],
      links: [
        { source: "analytics.tsx", target: "chart-lib.js", value: 2 },
        { source: "analytics.tsx", target: "data-service", value: 3 },
      ],
    }
  },
  {
    id: "mr-1206",
    title: "Fix memory leak in background worker service",
    author: "Jordan Lee",
    branch: "bugfix-worker",
    riskScore: 56,
    riskLevel: "high" as RiskLevel,
    updatedAt: "6h ago",
    graphData: {
      nodes: [
        { id: "worker-srv", name: "worker-srv", type: "service", risk: "high", isDirectTarget: true },
        { id: "job-queue", name: "job-queue", type: "module", risk: "medium" },
        { id: "redis-cache", name: "redis-cache", type: "service", risk: "medium" },
        { id: "monitoring-app", name: "monitoring-app", type: "service", risk: "low" },
      ],
      links: [
        { source: "worker-srv", target: "job-queue", value: 4 },
        { source: "worker-srv", target: "redis-cache", value: 2 },
        { source: "job-queue", target: "monitoring-app", value: 1 },
      ],
    }
  },
  {
    id: "mr-1207",
    title: "Add export to CSV functionality in audit logs",
    author: "Taylor Kim",
    branch: "feat-export",
    riskScore: 12,
    riskLevel: "low" as RiskLevel,
    updatedAt: "1d ago",
    graphData: {
      nodes: [
        { id: "audit-logs", name: "audit-logs", type: "file", risk: "low", isDirectTarget: true },
        { id: "csv-util", name: "csv-util", type: "module", risk: "low" },
        { id: "s3-client", name: "s3-client", type: "module", risk: "low" },
      ],
      links: [
        { source: "audit-logs", target: "csv-util", value: 1 },
        { source: "csv-util", target: "s3-client", value: 1 },
      ],
    }
  },
  {
    id: "mr-1208",
    title: "Refactor database connection pooling logic",
    author: "Sam Wilson",
    branch: "db-optimization",
    riskScore: 42,
    riskLevel: "medium" as RiskLevel,
    updatedAt: "2d ago",
    graphData: {
      nodes: [
        { id: "db-pool", name: "db-pool", type: "module", risk: "medium", isDirectTarget: true },
        { id: "pg-driver", name: "pg-driver", type: "module", risk: "low" },
        { id: "main-api", name: "main-api", type: "service", risk: "high" },
        { id: "replica-db", name: "replica-db", type: "service", risk: "medium" },
      ],
      links: [
        { source: "db-pool", target: "pg-driver", value: 1 },
        { source: "main-api", target: "db-pool", value: 5 },
        { source: "db-pool", target: "replica-db", value: 3 },
      ],
    }
  },
];

export const MOCK_GRAPH_DATA = MOCK_MRS[0].graphData;
