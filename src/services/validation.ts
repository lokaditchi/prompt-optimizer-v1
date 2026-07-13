/**
 * Zod validation schemas for all PromptForge types.
 *
 * Provides runtime validation and sanitization for user input and imported data.
 */

import { z } from 'zod';

// ── Primitive schemas ───────────────────────────────────────────────────

const placeholderSchema = z.object({
  key: z.string().min(1, 'Placeholder key is required'),
  defaultValue: z.string(),
  description: z.string(),
  type: z.enum(['text', 'select', 'number']),
  options: z.array(z.string()).optional(),
});

const modelParametersSchema = z.object({
  model: z.string().min(1, 'Model is required'),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().positive(),
  topP: z.number().min(0).max(1),
  frequencyPenalty: z.number().min(-2).max(2),
  presencePenalty: z.number().min(-2).max(2),
});

// ── Prompt & Version schemas ────────────────────────────────────────────

export const versionSchema = z.object({
  id: z.string().min(1),
  promptId: z.string().min(1),
  versionNumber: z.number().int().positive(),
  content: z.string(),
  systemMessage: z.string(),
  placeholders: z.array(placeholderSchema),
  parameters: modelParametersSchema,
  changeNote: z.string(),
  createdAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
});

export const promptSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Prompt name is required'),
  description: z.string(),
  currentVersionId: z.string().min(1),
  tags: z.array(z.string()),
  createdAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
  updatedAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
});

// ── Test Run schema ────────────────────────────────────────────────────

const testMetricsSchema = z.object({
  latencyMs: z.number().nonnegative(),
  promptTokens: z.number().int().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  estimatedCost: z.number().nonnegative(),
});

export const testRunSchema = z.object({
  id: z.string().min(1),
  promptVersionId: z.string().min(1),
  promptName: z.string(),
  resolvedPrompt: z.string(),
  systemMessage: z.string(),
  parameters: modelParametersSchema,
  response: z.string(),
  status: z.enum(['pending', 'running', 'success', 'error']),
  error: z.string().optional(),
  metrics: testMetricsSchema,
  createdAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
});

// ── Template schema ────────────────────────────────────────────────────

export const templateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum([
    'code-generation',
    'debugging',
    'code-review',
    'refactoring',
    'documentation',
    'testing',
    'architecture',
    'general',
  ]),
  description: z.string(),
  content: z.string(),
  systemMessage: z.string(),
  placeholders: z.array(placeholderSchema),
  defaultParameters: modelParametersSchema,
  isBuiltIn: z.boolean(),
  usageCount: z.number().int().nonnegative(),
  icon: z.string(),
});

// ── Import schema (for JSON import validation) ─────────────────────────

export const importDataSchema = z.object({
  prompt: promptSchema,
  versions: z.array(versionSchema).min(1, 'At least one version is required'),
});

// ── Validation functions ───────────────────────────────────────────────

/**
 * Validate a prompt object against the schema.
 * @returns A result object with success status and either the parsed data or error details.
 */
export function validatePrompt(data: unknown) {
  return promptSchema.safeParse(data);
}

/**
 * Validate a prompt version against the schema.
 */
export function validateVersion(data: unknown) {
  return versionSchema.safeParse(data);
}

/**
 * Validate import data (prompt + versions bundle).
 */
export function validateImportData(data: unknown) {
  return importDataSchema.safeParse(data);
}

// ── Sanitization ───────────────────────────────────────────────────────

/**
 * Strip all HTML tags from a string to prevent XSS.
 *
 * @example
 * sanitizeHtml('<script>alert("xss")</script>Hello') → 'alert("xss")Hello'
 */
export function sanitizeHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}
