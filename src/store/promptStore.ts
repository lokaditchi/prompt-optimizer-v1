/**
 * Prompt management Zustand store.
 *
 * Manages prompts and their version history with localStorage persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { ModelParameters, Placeholder, Prompt, PromptVersion } from '@/types';
import { DEFAULT_MODEL_PARAMS, STORAGE_KEYS } from '@/lib/constants';

interface PromptState {
  /** All saved prompts. */
  prompts: Prompt[];
  /** All prompt versions across all prompts. */
  versions: PromptVersion[];
  /** Currently selected prompt ID, or null if none. */
  activePromptId: string | null;
}

interface PromptActions {
  /** Create a new prompt with an initial empty version. */
  createPrompt: (name: string, description: string) => Prompt;
  /** Partially update a prompt by ID. */
  updatePrompt: (id: string, updates: Partial<Omit<Prompt, 'id' | 'createdAt'>>) => void;
  /** Delete a prompt and all of its versions. */
  deletePrompt: (id: string) => void;
  /** Create a new version for a prompt, incrementing the version number. */
  createVersion: (
    promptId: string,
    content: string,
    systemMessage: string,
    placeholders: Placeholder[],
    parameters: ModelParameters,
    changeNote: string,
  ) => PromptVersion;
  /** Set the active prompt by ID. */
  setActivePrompt: (id: string | null) => void;
  /** Get the currently active prompt (selector). */
  getActivePrompt: () => Prompt | undefined;
  /** Get all versions for a given prompt, sorted by version number ascending. */
  getVersionsForPrompt: (promptId: string) => PromptVersion[];
  /** Get the current (latest) version for a prompt. */
  getCurrentVersion: (promptId: string) => PromptVersion | undefined;
  /** Restore a historical version by creating a new version with its content. */
  restoreVersion: (versionId: string) => PromptVersion | undefined;
}

export type PromptStore = PromptState & PromptActions;

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────────
      prompts: [],
      versions: [],
      activePromptId: null,

      // ── Actions ────────────────────────────────────────────────────────

      createPrompt: (name, description) => {
        const now = new Date().toISOString();
        const promptId = nanoid();
        const versionId = nanoid();

        const initialVersion: PromptVersion = {
          id: versionId,
          promptId,
          versionNumber: 1,
          content: '',
          systemMessage: '',
          placeholders: [],
          parameters: { ...DEFAULT_MODEL_PARAMS },
          changeNote: 'Initial version',
          createdAt: now,
        };

        const prompt: Prompt = {
          id: promptId,
          name,
          description,
          currentVersionId: versionId,
          tags: [],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          prompts: [...state.prompts, prompt],
          versions: [...state.versions, initialVersion],
          activePromptId: promptId,
        }));

        return prompt;
      },

      updatePrompt: (id, updates) => {
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p,
          ),
        }));
      },

      deletePrompt: (id) => {
        set((state) => ({
          prompts: state.prompts.filter((p) => p.id !== id),
          versions: state.versions.filter((v) => v.promptId !== id),
          activePromptId:
            state.activePromptId === id ? null : state.activePromptId,
        }));
      },

      createVersion: (promptId, content, systemMessage, placeholders, parameters, changeNote) => {
        const state = get();
        const existing = state.versions.filter((v) => v.promptId === promptId);
        const maxVersion = existing.reduce(
          (max, v) => Math.max(max, v.versionNumber),
          0,
        );

        const version: PromptVersion = {
          id: nanoid(),
          promptId,
          versionNumber: maxVersion + 1,
          content,
          systemMessage,
          placeholders,
          parameters,
          changeNote,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          versions: [...state.versions, version],
          prompts: state.prompts.map((p) =>
            p.id === promptId
              ? {
                  ...p,
                  currentVersionId: version.id,
                  updatedAt: version.createdAt,
                }
              : p,
          ),
        }));

        return version;
      },

      setActivePrompt: (id) => {
        set({ activePromptId: id });
      },

      getActivePrompt: () => {
        const { prompts, activePromptId } = get();
        return prompts.find((p) => p.id === activePromptId);
      },

      getVersionsForPrompt: (promptId) => {
        return get()
          .versions.filter((v) => v.promptId === promptId)
          .sort((a, b) => a.versionNumber - b.versionNumber);
      },

      getCurrentVersion: (promptId) => {
        const state = get();
        const prompt = state.prompts.find((p) => p.id === promptId);
        if (!prompt) return undefined;
        return state.versions.find((v) => v.id === prompt.currentVersionId);
      },

      restoreVersion: (versionId) => {
        const state = get();
        const source = state.versions.find((v) => v.id === versionId);
        if (!source) return undefined;

        return state.createVersion(
          source.promptId,
          source.content,
          source.systemMessage,
          source.placeholders,
          source.parameters,
          `Restored from version ${source.versionNumber}`,
        );
      },
    }),
    {
      name: STORAGE_KEYS.PROMPTS,
    },
  ),
);
