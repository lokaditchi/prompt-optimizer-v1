/**
 * Settings Zustand store.
 *
 * Manages API keys, model selection, theme, and other user preferences.
 * All sensitive data (API keys) are stored only in localStorage via persist.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GEMINI_BASE_URL, STORAGE_KEYS } from '@/lib/constants';
import { ModelRegistry } from '@/services/models/modelRegistry';

interface SettingsState {
  /** User's Gemini API key. Stored only in localStorage. */
  apiKey: string;
  /** Gemini API base URL. */
  baseUrl: string;
  /** Default model to use for new test runs. */
  defaultModel: string;
  /** UI color theme preference. */
  theme: 'dark' | 'light' | 'system';
  /** Dynamically fetched available models */
  availableModels: string[];
}

interface SettingsActions {
  /** Update the API key. */
  setApiKey: (apiKey: string) => void;
  /** Update the API base URL. */
  setBaseUrl: (baseUrl: string) => void;
  /** Set the default model. */
  setModel: (model: string) => void;
  /** Set available models */
  setAvailableModels: (models: string[]) => void;
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
      defaultModel: 'gemini-3.5-flash',
      theme: 'system',
      availableModels: ModelRegistry.getIds(),

      // ── Actions ────────────────────────────────────────────────────────

      setApiKey: (apiKey) => set({ apiKey }),
      setBaseUrl: (baseUrl) => set({ baseUrl }),
      setModel: (defaultModel) => set({ defaultModel }),
      setAvailableModels: (availableModels) => set({ availableModels }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      partialize: (state) => ({
        apiKey: state.apiKey,
        theme: state.theme,
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        apiKey: persistedState?.apiKey ?? currentState.apiKey,
        theme: persistedState?.theme ?? currentState.theme,
      }),
    },
  ),
);
