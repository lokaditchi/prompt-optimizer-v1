/**
 * Test execution Zustand store.
 *
 * Manages test run history and current execution state with persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TestRun } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

interface TestState {
  /** All recorded test runs, most recent last. */
  testRuns: TestRun[];
  /** Whether a test is currently being executed. */
  isRunning: boolean;
  /** ID of the currently selected / active test run. */
  activeTestId: string | null;
}

interface TestActions {
  /** Add a new test run to history. */
  addTestRun: (run: TestRun) => void;
  /** Partially update an existing test run (e.g. for streaming progress). */
  updateTestRun: (id: string, updates: Partial<Omit<TestRun, 'id'>>) => void;
  /** Set the global running flag. */
  setRunning: (isRunning: boolean) => void;
  /** Set the active test run by ID. */
  setActiveTest: (id: string | null) => void;
  /** Clear all test run history. */
  clearHistory: () => void;
  /** Get the N most recent test runs. */
  getRecentRuns: (limit: number) => TestRun[];
}

export type TestStore = TestState & TestActions;

export const useTestStore = create<TestStore>()(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────────
      testRuns: [],
      isRunning: false,
      activeTestId: null,

      // ── Actions ────────────────────────────────────────────────────────

      addTestRun: (run) => {
        set((state) => ({
          testRuns: [...state.testRuns, run],
        }));
      },

      updateTestRun: (id, updates) => {
        set((state) => ({
          testRuns: state.testRuns.map((run) =>
            run.id === id ? { ...run, ...updates } : run,
          ),
        }));
      },

      setRunning: (isRunning) => {
        set({ isRunning });
      },

      setActiveTest: (id) => {
        set({ activeTestId: id });
      },

      clearHistory: () => {
        set({ testRuns: [], activeTestId: null });
      },

      getRecentRuns: (limit) => {
        const { testRuns } = get();
        return testRuns.slice(-limit);
      },
    }),
    {
      name: STORAGE_KEYS.TESTS,
      // Don't persist the transient `isRunning` flag — always start as false.
      partialize: (state) => ({
        testRuns: state.testRuns,
        activeTestId: state.activeTestId,
      }),
    },
  ),
);
