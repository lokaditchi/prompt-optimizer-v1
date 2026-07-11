/**
 * Global keyboard shortcuts hook.
 *
 * Registers application-wide keyboard shortcuts using a single
 * event listener on the document. This is a side-effect-only hook
 * that returns nothing.
 */

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

/** Callback map for keyboard shortcuts. */
export interface ShortcutHandlers {
  /** Ctrl+S / Cmd+S: Save current prompt version. */
  onSave?: () => void;
  /** Ctrl+Enter / Cmd+Enter: Run test. */
  onRunTest?: () => void;
  /** Ctrl+K / Cmd+K: Toggle command palette. */
  onToggleCommandPalette?: () => void;
}

/**
 * Hook that registers global keyboard shortcuts.
 *
 * All shortcuts use Ctrl on Windows/Linux and Cmd on macOS.
 * Escape always closes the active modal regardless of handlers.
 *
 * @param handlers - Optional callback map for shortcut actions.
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   onSave: () => saveCurrentVersion(),
 *   onRunTest: () => runTest(),
 * });
 * ```
 */
export function useKeyboardShortcuts(handlers?: ShortcutHandlers): void {
  const closeModal = useUIStore((s) => s.closeModal);
  const activeModal = useUIStore((s) => s.activeModal);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isModifier = event.ctrlKey || event.metaKey;

      // ── Escape: close modal ─────────────────────────────────────────
      if (event.key === 'Escape') {
        if (activeModal) {
          event.preventDefault();
          closeModal();
          return;
        }
      }

      // Don't trigger shortcuts when typing in inputs/textareas
      // unless the modifier key is held
      if (!isModifier) return;

      const target = event.target as HTMLElement;
      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // ── Ctrl+S: Save ────────────────────────────────────────────────
      if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        handlers?.onSave?.();
        return;
      }

      // ── Ctrl+Enter: Run test ────────────────────────────────────────
      if (event.key === 'Enter') {
        event.preventDefault();
        handlers?.onRunTest?.();
        return;
      }

      // ── Ctrl+K: Command palette ─────────────────────────────────────
      if (event.key === 'k' || event.key === 'K') {
        // Don't hijack if user is typing in an input without explicit intent
        if (isEditable && !event.shiftKey) return;
        event.preventDefault();
        handlers?.onToggleCommandPalette?.();
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers, closeModal, activeModal]);
}
