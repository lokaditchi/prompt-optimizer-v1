/**
 * Application-wide constants for PromptForge.
 */

import type { ModelParameters } from '@/types';

/** Application metadata. */
export const APP_NAME = 'PromptForge' as const;
export const APP_VERSION = '1.0.0' as const;

/** Keys used for Zustand persist middleware and localStorage. */
export const STORAGE_KEYS = {
  PROMPTS: 'promptforge-prompts',
  TESTS: 'promptforge-tests',
  SETTINGS: 'promptforge-settings',
} as const;

/** Default model generation parameters for new prompts. */
export const DEFAULT_MODEL_PARAMS: ModelParameters = {
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.95,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

/** Available Gemini model identifiers. */
export const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-2.0-flash-exp'
] as const;

export type GeminiModel = (typeof GEMINI_MODELS)[number];

/**
 * Per-token pricing in USD for Gemini models.
 * Prices are per 1 token (not per 1K or 1M tokens).
 * Source: Google AI pricing as of mid-2026.
 */
export const MODEL_PRICING: Record<
  string,
  { inputPerToken: number; outputPerToken: number }
> = {
  'gemini-1.5-flash': {
    inputPerToken: 0.000_000_075, // $0.075 per 1M input tokens
    outputPerToken: 0.000_000_3, // $0.30  per 1M output tokens
  },
  'gemini-1.5-flash-8b': {
    inputPerToken: 0.000_000_0375, // $0.0375 per 1M input tokens
    outputPerToken: 0.000_000_15, // $0.15 per 1M output tokens
  },
  'gemini-1.5-pro': {
    inputPerToken: 0.000_001_25, // $1.25 per 1M input tokens
    outputPerToken: 0.000_005, // $5.00 per 1M output tokens
  },
  'gemini-2.0-flash-exp': {
    inputPerToken: 0.000_000_00, // Free during experimental phase
    outputPerToken: 0.000_000_00,
  }
};

/** Default Gemini API base URL. */
export const GEMINI_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta';
