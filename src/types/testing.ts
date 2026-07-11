/**
 * Types for test execution, results, and A/B testing.
 */

import type { ModelParameters } from './prompt';

/** Performance and usage metrics captured during a single test run. */
export interface TestMetrics {
  /** End-to-end latency in milliseconds from request to final response. */
  latencyMs: number;
  /** Number of tokens in the prompt (input). */
  promptTokens: number;
  /** Number of tokens in the completion (output). */
  completionTokens: number;
  /** Total tokens consumed (prompt + completion). */
  totalTokens: number;
  /** Estimated cost in USD based on model pricing. */
  estimatedCost: number;
}

/** A single test execution of a prompt version against the AI model. */
export interface TestRun {
  /** Unique identifier for this test run. */
  id: string;
  /** The prompt version that was tested. */
  promptVersionId: string;
  /** Display name of the parent prompt (denormalized for convenience). */
  promptName: string;
  /** The fully-resolved prompt with all placeholders filled in. */
  resolvedPrompt: string;
  /** System message sent with the prompt. */
  systemMessage: string;
  /** Model parameters used for this run. */
  parameters: ModelParameters;
  /** The AI model's response text. */
  response: string;
  /** Current lifecycle status of the test run. */
  status: 'pending' | 'running' | 'success' | 'error';
  /** Error message if status is 'error'. */
  error?: string;
  /** Captured performance and usage metrics. */
  metrics: TestMetrics;
  /** ISO 8601 timestamp of when this run was initiated. */
  createdAt: string;
}

/** An A/B test comparing two prompt versions head-to-head. */
export interface ABTest {
  /** Unique identifier for this A/B test. */
  id: string;
  /** Human-readable name for this comparison. */
  name: string;
  /** Variant A configuration and results. */
  variantA: { promptVersionId: string; runs: TestRun[] };
  /** Variant B configuration and results. */
  variantB: { promptVersionId: string; runs: TestRun[] };
  /** Number of test runs to execute per variant. */
  sampleSize: number;
  /** Current lifecycle status of the A/B test. */
  status: 'draft' | 'running' | 'completed';
  /** Declared winner after completion, if any. */
  winner?: 'A' | 'B' | 'inconclusive';
  /** Statistical significance level (0–1) of the result. */
  significance?: number;
  /** ISO 8601 timestamp of when this A/B test was created. */
  createdAt: string;
}
