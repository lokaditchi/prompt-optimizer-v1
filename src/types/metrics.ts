/**
 * Aggregate metrics types for analytics and reporting dashboards.
 */

/** Pre-computed aggregate metrics across multiple test runs. */
export interface AggregateMetrics {
  /** Total number of test runs included in the aggregate. */
  totalRuns: number;
  /** Percentage of runs that completed successfully (0–1). */
  successRate: number;
  /** Average end-to-end latency in milliseconds. */
  avgLatencyMs: number;
  /** Sum of all tokens consumed across all runs. */
  totalTokens: number;
  /** Sum of all prompt (input) tokens. */
  totalPromptTokens: number;
  /** Sum of all completion (output) tokens. */
  totalCompletionTokens: number;
  /** Sum of all estimated costs in USD. */
  totalEstimatedCost: number;
  /** Latency trend data grouped by date. */
  latencyOverTime: { date: string; avgLatency: number; count: number }[];
  /** Per-run token breakdown for scatter/bar charts. */
  tokensByRun: {
    runId: string;
    date: string;
    promptTokens: number;
    completionTokens: number;
  }[];
  /** Daily cost breakdown for cost-tracking charts. */
  costByDay: { date: string; cost: number }[];
}
