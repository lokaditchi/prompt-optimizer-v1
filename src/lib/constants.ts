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
  model: 'google/gemma-4-31b-it:free',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.95,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

/** Available Gemini model identifiers. */
export const GEMINI_MODELS = [
  'google/gemma-4-31b-it:free',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
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
  'google/gemma-4-31b-it:free': {
    inputPerToken: 0,
    outputPerToken: 0,
  },
  'gemini-2.0-flash': {
    inputPerToken: 0.000_000_075,
    outputPerToken: 0.000_000_3,
  },
  'gemini-2.5-flash': {
    inputPerToken: 0.000_000_15,
    outputPerToken: 0.000_000_6,
  },
  'gemini-2.5-pro': {
    inputPerToken: 0.000_001_25,
    outputPerToken: 0.000_01,
  }
};

/** Default Gemini API base URL. */
export const GEMINI_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta';
