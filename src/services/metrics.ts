/**
 * Metrics computation service.
 *
 * Aggregates test run data into summary statistics for dashboards and charts.
 * Includes model-specific pricing estimation for Gemini models.
 */

import type { AggregateMetrics, TestRun } from '@/types';
import { MODEL_PRICING } from '@/lib/constants';

/**
 * Estimate the cost of a single API call based on token counts and model.
 *
 * @param model - The model identifier (e.g. 'gemini-2.0-flash').
 * @param promptTokens - Number of input tokens.
 * @param completionTokens - Number of output tokens.
 * @returns Estimated cost in USD. Returns 0 if the model is not in the pricing table.
 */
export function estimateCost(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;

  return (
    promptTokens * pricing.inputPerToken +
    completionTokens * pricing.outputPerToken
  );
}

/**
 * Compute aggregate metrics from an array of test runs.
 *
 * This function handles:
 * - Success rate calculation
 * - Average latency
 * - Token totals and per-run breakdowns
 * - Time-series data grouped by date for charts
 *
 * @param testRuns - The test runs to aggregate.
 * @returns Computed aggregate metrics.
 */
export function computeAggregateMetrics(
  testRuns: TestRun[],
): AggregateMetrics {
  if (testRuns.length === 0) {
    return {
      totalRuns: 0,
      successRate: 0,
      avgLatencyMs: 0,
      totalTokens: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalEstimatedCost: 0,
      latencyOverTime: [],
      tokensByRun: [],
      costByDay: [],
    };
  }

  const successfulRuns = testRuns.filter((r) => r.status === 'success');
  const successRate =
    testRuns.length > 0 ? successfulRuns.length / testRuns.length : 0;

  // Totals
  let totalLatency = 0;
  let totalTokens = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalEstimatedCost = 0;

  for (const run of testRuns) {
    totalLatency += run.metrics.latencyMs;
    totalTokens += run.metrics.totalTokens;
    totalPromptTokens += run.metrics.promptTokens;
    totalCompletionTokens += run.metrics.completionTokens;
    totalEstimatedCost += run.metrics.estimatedCost;
  }

  const avgLatencyMs = totalLatency / testRuns.length;

  // ── Latency over time (grouped by date) ─────────────────────────────
  const latencyByDate = new Map<
    string,
    { totalLatency: number; count: number }
  >();
  for (const run of testRuns) {
    const date = run.createdAt.slice(0, 10); // YYYY-MM-DD
    const existing = latencyByDate.get(date) ?? {
      totalLatency: 0,
      count: 0,
    };
    existing.totalLatency += run.metrics.latencyMs;
    existing.count += 1;
    latencyByDate.set(date, existing);
  }

  const latencyOverTime = Array.from(latencyByDate.entries())
    .map(([date, data]) => ({
      date,
      avgLatency: data.totalLatency / data.count,
      count: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ── Tokens by run ───────────────────────────────────────────────────
  const tokensByRun = testRuns.map((run) => ({
    runId: run.id,
    date: run.createdAt.slice(0, 10),
    promptTokens: run.metrics.promptTokens,
    completionTokens: run.metrics.completionTokens,
  }));

  // ── Cost by day ─────────────────────────────────────────────────────
  const costMap = new Map<string, number>();
  for (const run of testRuns) {
    const date = run.createdAt.slice(0, 10);
    costMap.set(date, (costMap.get(date) ?? 0) + run.metrics.estimatedCost);
  }

  const costByDay = Array.from(costMap.entries())
    .map(([date, cost]) => ({ date, cost }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRuns: testRuns.length,
    successRate,
    avgLatencyMs,
    totalTokens,
    totalPromptTokens,
    totalCompletionTokens,
    totalEstimatedCost,
    latencyOverTime,
    tokensByRun,
    costByDay,
  };
}

/**
 * Filter test runs to a specific date range (inclusive).
 *
 * @param runs - All test runs.
 * @param startDate - Start date as ISO string or YYYY-MM-DD.
 * @param endDate - End date as ISO string or YYYY-MM-DD.
 * @returns Filtered subset of runs within the date range.
 */
export function filterByDateRange(
  runs: TestRun[],
  startDate: string,
  endDate: string,
): TestRun[] {
  const start = new Date(startDate).getTime();
  // Set end date to end of day
  const end = new Date(endDate).getTime() + 86_400_000 - 1;

  return runs.filter((run) => {
    const runTime = new Date(run.createdAt).getTime();
    return runTime >= start && runTime <= end;
  });
}
