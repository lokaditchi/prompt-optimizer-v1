/**
 * Custom hook for executing prompt test runs.
 *
 * Manages the full lifecycle of a test: initiation, streaming response
 * collection, metrics capture, error handling, and cancellation.
 */

import { useCallback, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import type { ModelParameters, TestRun } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { useTestStore } from '@/store/testStore';
import { sendPromptStreaming } from '@/services/ai/aiService';
import { estimateCost } from '@/services/metrics';

interface UseTestRunnerReturn {
  /** Execute a test run with the given prompt and parameters. */
  runTest: (
    prompt: string,
    systemMessage: string,
    parameters: ModelParameters,
    promptName?: string,
    promptVersionId?: string,
  ) => Promise<void>;
  /** Cancel the currently running test. */
  cancelTest: () => void;
  /** Whether a test is currently executing. */
  isRunning: boolean;
  /** The response text accumulated so far (for streaming display). */
  currentResponse: string;
  /** Error message from the last run, if any. */
  error: string | null;
}

/**
 * Hook that orchestrates test execution against the Gemini API.
 *
 * @example
 * ```tsx
 * const { runTest, cancelTest, isRunning, currentResponse } = useTestRunner();
 *
 * const handleRun = () => {
 *   runTest('Explain TypeScript generics', 'You are a helpful tutor.', params);
 * };
 * ```
 */
export function useTestRunner(): UseTestRunnerReturn {
  const [currentResponse, setCurrentResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const apiKey = useSettingsStore((s) => s.apiKey);
  const { addTestRun, updateTestRun, setRunning, isRunning } = useTestStore();

  const runTest = useCallback(
    async (
      prompt: string,
      systemMessage: string,
      parameters: ModelParameters,
      promptName = 'Untitled',
      promptVersionId = '',
    ) => {
      if (!apiKey) {
        setError('API key not configured. Please add your Gemini API key in Settings.');
        return;
      }

      // Reset state
      setError(null);
      setCurrentResponse('');

      // Create abort controller for cancellation
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const runId = nanoid();
      const startTime = performance.now();

      // Create initial test run record
      const testRun: TestRun = {
        id: runId,
        promptVersionId,
        promptName,
        resolvedPrompt: prompt,
        systemMessage,
        parameters,
        response: '',
        status: 'running',
        metrics: {
          latencyMs: 0,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          estimatedCost: 0,
        },
        createdAt: new Date().toISOString(),
      };

      addTestRun(testRun);
      setRunning(true);

      try {
        let fullResponse = '';
        let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

        const stream = sendPromptStreaming({
          prompt,
          systemMessage: systemMessage || undefined,
          model: parameters.model,
          apiKey,
          temperature: parameters.temperature,
          maxTokens: parameters.maxTokens,
          topP: parameters.topP,
          signal: controller.signal,
        });

        for await (const chunk of stream) {
          if (controller.signal.aborted) break;

          if (chunk.type === 'chunk' && chunk.text) {
            fullResponse += chunk.text;
            setCurrentResponse(fullResponse);

            // Update the store periodically for persistence
            updateTestRun(runId, { response: fullResponse });
          }

          if (chunk.type === 'done' && chunk.usage) {
            usage = chunk.usage;
          }
        }

        const latencyMs = performance.now() - startTime;
        const cost = estimateCost(
          parameters.model,
          usage.promptTokens,
          usage.completionTokens,
        );

        // Final update with complete metrics
        updateTestRun(runId, {
          response: fullResponse,
          status: 'success',
          metrics: {
            latencyMs,
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            totalTokens: usage.totalTokens,
            estimatedCost: cost,
          },
        });
      } catch (err) {
        if (controller.signal.aborted) {
          updateTestRun(runId, {
            status: 'error',
            error: 'Test cancelled by user',
            metrics: {
              ...testRun.metrics,
              latencyMs: performance.now() - startTime,
            },
          });
          setError('Test cancelled');
        } else {
          const errorMessage =
            err instanceof Error ? err.message : 'An unknown error occurred';
          updateTestRun(runId, {
            status: 'error',
            error: errorMessage,
            metrics: {
              ...testRun.metrics,
              latencyMs: performance.now() - startTime,
            },
          });
          setError(errorMessage);
        }
      } finally {
        setRunning(false);
        abortControllerRef.current = null;
      }
    },
    [apiKey, addTestRun, updateTestRun, setRunning],
  );

  const cancelTest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    runTest,
    cancelTest,
    isRunning,
    currentResponse,
    error,
  };
}
