/**
 * UI state Zustand store (not persisted).
 *
 * Manages transient UI state like sidebar visibility, modals, and toast
 * notifications that should not survive page reloads.
 */

import { create } from 'zustand';
import { nanoid } from 'nanoid';

/** A toast notification message. */
export interface Toast {
  /** Unique identifier. */
  id: string;
  /** Display message. */
  message: string;
  /** Visual style / severity. */
  type: 'success' | 'error' | 'info' | 'warning';
  /** Auto-dismiss duration in milliseconds. */
  duration: number;
}

interface UIState {
  /** Whether the sidebar drawer is open (mobile). */
  sidebarOpen: boolean;
  /** Whether the sidebar is collapsed to icons-only (desktop). */
  sidebarCollapsed: boolean;
  /** The currently displayed modal identifier, or null. */
  activeModal: string | null;
  /** Active toast notifications. */
  toasts: Toast[];
}

interface UIActions {
  /** Toggle sidebar open/closed state. */
  toggleSidebar: () => void;
  /** Toggle sidebar collapsed/expanded state. */
  collapseSidebar: () => void;
  /** Open a modal by identifier. */
  openModal: (modalId: string) => void;
  /** Close the currently active modal. */
  closeModal: () => void;
  /** Add a toast notification. Returns the toast ID for manual dismissal. */
  addToast: (
    message: string,
    type?: Toast['type'],
    duration?: number,
  ) => string;
  /** Remove a specific toast by ID. */
  removeToast: (id: string) => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()((set) => ({
  // ── State ────────────────────────────────────────────────────────────
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeModal: null,
  toasts: [],

  // ── Actions ──────────────────────────────────────────────────────────

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  collapseSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  openModal: (modalId) => set({ activeModal: modalId }),

  closeModal: () => set({ activeModal: null }),

  addToast: (message, type = 'info', duration = 4000) => {
    const id = nanoid();
    const toast: Toast = { id, message, type, duration };

    set((state) => ({ toasts: [...state.toasts, toast] }));

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
