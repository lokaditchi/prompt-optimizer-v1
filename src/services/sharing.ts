/**
 * Sharing service for PromptForge.
 *
 * Enables URL-based and JSON-based prompt sharing between users.
 * Prompt data is base64-encoded into the URL hash for stateless sharing.
 */

import type { Prompt, PromptVersion } from '@/types';
import { importDataSchema } from './validation';

/** Compact shareable representation of a prompt. */
interface ShareablePayload {
  /** Format version for forward compatibility. */
  v: 1;
  /** Prompt metadata. */
  p: Prompt;
  /** Prompt version data. */
  vs: PromptVersion[];
}

/**
 * Encode a prompt and its active version into a URL hash string.
 *
 * The data is JSON-serialized, then base64-encoded for URL safety.
 *
 * @param prompt - The prompt to share.
 * @param version - The specific version to include.
 * @returns A hash string (without the leading `#`) to append to a URL.
 *
 * @example
 * const hash = encodePromptToUrl(prompt, version);
 * const shareUrl = `${window.location.origin}/#/shared/${hash}`;
 */
export function encodePromptToUrl(
  prompt: Prompt,
  version: PromptVersion,
): string {
  const payload: ShareablePayload = {
    v: 1,
    p: prompt,
    vs: [version],
  };

  const json = JSON.stringify(payload);
  // Use btoa with URI encoding to handle Unicode characters
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64;
}

/**
 * Decode a URL hash back into prompt and version data.
 *
 * @param hash - The base64-encoded hash string (without leading `#`).
 * @returns The decoded and validated prompt and versions.
 * @throws If the hash is malformed or validation fails.
 */
export function decodePromptFromUrl(hash: string): {
  prompt: Prompt;
  versions: PromptVersion[];
} {
  try {
    const json = decodeURIComponent(escape(atob(hash)));
    const parsed = JSON.parse(json);

    // Normalize from shareable format to import format
    const importData = {
      prompt: parsed.p ?? parsed.prompt,
      versions: parsed.vs ?? parsed.versions,
    };

    const result = importDataSchema.safeParse(importData);

    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new Error(`Invalid shared prompt: ${issues}`);
    }

    return {
      prompt: result.data.prompt,
      versions: result.data.versions,
    };
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Invalid shared prompt')) {
      throw err;
    }
    throw new Error(
      'Failed to decode shared prompt. The link may be corrupted or expired.',
    );
  }
}

/**
 * Generate a nicely formatted JSON string for sharing a prompt
 * via copy-paste, file download, etc.
 *
 * @param prompt - The prompt to share.
 * @param versions - All versions to include.
 * @returns A formatted JSON string.
 */
export function generateShareableJson(
  prompt: Prompt,
  versions: PromptVersion[],
): string {
  return JSON.stringify(
    {
      format: 'promptforge-v1',
      sharedAt: new Date().toISOString(),
      prompt,
      versions,
    },
    null,
    2,
  );
}
