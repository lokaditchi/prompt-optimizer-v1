/**
 * Settings Zustand store.
 *
 * Manages API keys, model selection, theme, and other user preferences.
 * All sensitive data (API keys) are stored only in localStorage via persist.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GEMINI_BASE_URL, GEMINI_MODELS, STORAGE_KEYS } from '@/lib/constants';

interface SettingsState {
  /** User's Gemini API key. Stored only in localStorage. */
  apiKey: string;
  /** Gemini API base URL. */
  baseUrl: string;
  /** Default model to use for new test runs. */
  defaultModel: string;
  /** UI color theme preference. */
  theme: 'dark' | 'light' | 'system';
}

interface SettingsActions {
  /** Update the API key. */
  setApiKey: (apiKey: string) => void;
  /** Update the API base URL. */
  setBaseUrl: (baseUrl: string) => void;
  /** Set the default model. */
  setModel: (model: string) => void;
  /** Set the theme preference. */
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // ── State ──────────────────────────────────────────────────────────
      apiKey: '',
      baseUrl: GEMINI_BASE_URL,
      defaultModel: 'gemini-3.0-flash',
      theme: 'system',

      // ── Actions ────────────────────────────────────────────────────────

      setApiKey: (apiKey) => set({ apiKey }),
      setBaseUrl: (baseUrl) => set({ baseUrl }),
      setModel: (defaultModel) => set({ defaultModel }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
    },
  ),
);
