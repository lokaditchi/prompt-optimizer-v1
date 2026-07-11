/**
 * General-purpose utility functions used across PromptForge.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS class names, resolving conflicts.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO 8601 date string into a human-readable local format.
 * @example formatDate('2026-07-12T01:56:02Z') → "Jul 12, 2026, 1:56 AM"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format a duration in milliseconds to a human-readable string.
 * @example formatDuration(1234) → "1.23s"
 * @example formatDuration(456) → "456ms"
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  const minutes = Math.floor(ms / 60_000);
  const seconds = ((ms % 60_000) / 1000).toFixed(1);
  return `${minutes}m ${seconds}s`;
}

/**
 * Format a token count with locale-aware thousands separators.
 * @example formatTokenCount(123456) → "123,456"
 */
export function formatTokenCount(tokens: number): string {
  return tokens.toLocaleString('en-US');
}

/**
 * Format a cost value in USD.
 * Uses up to 6 decimal places for very small amounts.
 * @example formatCost(0.00123) → "$0.001230"
 * @example formatCost(1.5) → "$1.50"
 */
export function formatCost(cost: number): string {
  if (cost === 0) return '$0.00';
  if (cost < 0.01) {
    return `$${cost.toFixed(6)}`;
  }
  return `$${cost.toFixed(2)}`;
}

/**
 * Truncate text to a maximum length, appending an ellipsis if truncated.
 * @example truncateText('Hello, world!', 5) → "Hello…"
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

/**
 * Create a debounced version of a function.
 * The returned function delays invocation until after `delayMs` milliseconds
 * have elapsed since the last call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delayMs);
  };
}

/**
 * Copy text to the clipboard using the Clipboard API.
 * Falls back to document.execCommand for older browsers.
 * @returns true if the copy was successful.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for non-secure contexts
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

/**
 * Download a string as a file via a temporary anchor element.
 * @param content - The file content as a string.
 * @param filename - Desired filename (e.g. 'prompt.json').
 * @param mimeType - MIME type (default: 'application/json').
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType = 'application/json',
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
