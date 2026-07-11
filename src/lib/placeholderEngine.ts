/**
 * Placeholder detection, resolution, and validation engine.
 *
 * Prompts can contain dynamic placeholders using the `{{key}}` syntax.
 * This module handles parsing those placeholders and substituting values.
 */

import type { Placeholder } from '@/types';

/** Regex matching `{{key}}` patterns. Captures the key (trimmed). */
const PLACEHOLDER_REGEX = /\{\{\s*([a-zA-Z_]\w*)\s*\}\}/g;

/**
 * Detect all unique `{{key}}` placeholders in a prompt template string.
 *
 * Returns a `Placeholder[]` with sensible defaults. If a placeholder
 * appears more than once in the content, it is included only once.
 *
 * @example
 * detectPlaceholders('Write {{language}} code for {{task}}')
 * // [
 * //   { key: 'language', defaultValue: '', description: '', type: 'text' },
 * //   { key: 'task',     defaultValue: '', description: '', type: 'text' },
 * // ]
 */
export function detectPlaceholders(content: string): Placeholder[] {
  const seen = new Set<string>();
  const placeholders: Placeholder[] = [];

  let match: RegExpExecArray | null;
  // Reset lastIndex in case the regex was used before
  PLACEHOLDER_REGEX.lastIndex = 0;

  while ((match = PLACEHOLDER_REGEX.exec(content)) !== null) {
    const key = match[1];
    if (!seen.has(key)) {
      seen.add(key);
      placeholders.push({
        key,
        defaultValue: '',
        description: '',
        type: 'text',
      });
    }
  }

  return placeholders;
}

/**
 * Resolve all `{{key}}` placeholders in `content` by substituting values
 * from the provided map. Unknown placeholders are left as-is.
 *
 * @param content - The template string containing `{{key}}` placeholders.
 * @param values  - A map of key → replacement value.
 * @returns The resolved string with placeholders replaced.
 *
 * @example
 * resolvePlaceholders('Hello {{name}}!', { name: 'World' })
 * // "Hello World!"
 */
export function resolvePlaceholders(
  content: string,
  values: Record<string, string>,
): string {
  return content.replace(PLACEHOLDER_REGEX, (fullMatch, key: string) => {
    if (key in values && values[key] !== '') {
      return values[key];
    }
    return fullMatch; // Leave unresolved placeholders intact
  });
}

/**
 * Validate that every declared placeholder has a corresponding non-empty
 * value in the provided map, and that every `{{key}}` in the content is
 * covered by the declared placeholders.
 *
 * @returns An object with `valid` status and an array of `errors`.
 */
export function validatePlaceholders(
  content: string,
  placeholders: Placeholder[],
  values: Record<string, string> = {},
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const declaredKeys = new Set(placeholders.map((p) => p.key));
  const detectedKeys = detectPlaceholders(content).map((p) => p.key);

  // Check that all detected placeholders are declared
  for (const key of detectedKeys) {
    if (!declaredKeys.has(key)) {
      errors.push(
        `Placeholder "{{${key}}}" found in content but not declared in the placeholder list.`,
      );
    }
  }

  // Check that all declared placeholders exist in the content
  for (const placeholder of placeholders) {
    if (!detectedKeys.includes(placeholder.key)) {
      errors.push(
        `Declared placeholder "${placeholder.key}" is not used in the prompt content.`,
      );
    }
  }

  // If values were provided, check completeness
  if (Object.keys(values).length > 0) {
    for (const key of detectedKeys) {
      if (!(key in values) || values[key].trim() === '') {
        errors.push(`Placeholder "{{${key}}}" has no value provided.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
