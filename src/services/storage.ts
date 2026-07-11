/**
 * Storage service for exporting and importing prompts as JSON.
 *
 * Handles serialization, deserialization, and validation of prompt data
 * for file-based export/import workflows.
 */

import type { Prompt, PromptVersion } from '@/types';
import { importDataSchema } from './validation';

/** The shape of an exported prompt JSON file. */
export interface PromptExportData {
  /** Format identifier for forward compatibility. */
  format: 'promptforge-v1';
  /** ISO 8601 timestamp of export. */
  exportedAt: string;
  /** The prompt metadata. */
  prompt: Prompt;
  /** All versions belonging to this prompt. */
  versions: PromptVersion[];
}

/**
 * Serialize a prompt and its versions to a JSON string for export.
 *
 * @param prompt - The prompt to export.
 * @param versions - All versions belonging to this prompt.
 * @returns A formatted JSON string ready for download.
 */
export function exportPromptAsJson(
  prompt: Prompt,
  versions: PromptVersion[],
): string {
  const data: PromptExportData = {
    format: 'promptforge-v1',
    exportedAt: new Date().toISOString(),
    prompt,
    versions,
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Parse and validate a JSON string as prompt import data.
 *
 * @param json - The raw JSON string to parse.
 * @returns The validated prompt and versions, or throws on invalid input.
 */
export function importPromptFromJson(json: string): {
  prompt: Prompt;
  versions: PromptVersion[];
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON: unable to parse the file contents.');
  }

  // Handle both raw { prompt, versions } and wrapped { format, prompt, versions }
  const payload =
    typeof parsed === 'object' &&
    parsed !== null &&
    'format' in parsed &&
    (parsed as Record<string, unknown>).format === 'promptforge-v1'
      ? parsed
      : parsed;

  const result = importDataSchema.safeParse(payload);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Validation failed: ${issues}`);
  }

  return {
    prompt: result.data.prompt,
    versions: result.data.versions,
  };
}
