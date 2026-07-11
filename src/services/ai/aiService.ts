/**
 * Unified AI service for PromptForge.
 *
 * Provides streaming and non-streaming access to the Google Gemini API.
 * All communication goes through the generativelanguage.googleapis.com REST API.
 */

import { GEMINI_BASE_URL } from '@/lib/constants';

/** Structured response from the AI service. */
export interface AIServiceResponse {
  /** The generated text content. */
  content: string;
  /** Number of tokens in the input prompt. */
  promptTokens: number;
  /** Number of tokens in the generated completion. */
  completionTokens: number;
  /** Total tokens consumed (prompt + completion). */
  totalTokens: number;
  /** The model that produced this response. */
  model: string;
}

/** Parameters for a prompt request. */
export interface PromptParams {
  /** The resolved prompt text to send. */
  prompt: string;
  /** Optional system-level instruction. */
  systemMessage?: string;
  /** Model identifier (e.g. 'gemini-2.0-flash'). */
  model: string;
  /** API key for authentication. */
  apiKey: string;
  /** Sampling temperature (0–2). */
  temperature?: number;
  /** Maximum tokens in the response. */
  maxTokens?: number;
  /** Nucleus sampling threshold (0–1). */
  topP?: number;
  /** AbortSignal for cancellation support. */
  signal?: AbortSignal;
}

/** Chunk yielded during streaming generation. */
export type StreamChunk =
  | { type: 'chunk'; text: string }
  | {
      type: 'done';
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    };

/**
 * Build the Gemini request body from prompt parameters.
 */
function buildRequestBody(params: PromptParams) {
  const body: Record<string, unknown> = {
    contents: [
      {
        parts: [{ text: params.prompt }],
      },
    ],
    generationConfig: {
      temperature: params.temperature ?? 0.7,
      maxOutputTokens: params.maxTokens ?? 2048,
      topP: params.topP ?? 0.95,
    },
  };

  if (params.systemMessage && params.systemMessage.trim()) {
    body.systemInstruction = {
      parts: [{ text: params.systemMessage }],
    };
  }

  return body;
}

/**
 * Send a prompt to Gemini and stream the response as an async generator.
 *
 * Uses the `streamGenerateContent` endpoint with SSE (Server-Sent Events).
 * Yields `chunk` events with incremental text, and a final `done` event
 * with token usage statistics.
 *
 * @example
 * ```ts
 * for await (const chunk of sendPromptStreaming({ prompt: 'Hello', model: 'gemini-2.0-flash', apiKey })) {
 *   if (chunk.type === 'chunk') process.stdout.write(chunk.text);
 *   if (chunk.type === 'done') console.log('Tokens:', chunk.usage);
 * }
 * ```
 */
export async function* sendPromptStreaming(
  params: PromptParams,
): AsyncGenerator<StreamChunk> {
  const baseUrl = GEMINI_BASE_URL;
  const url = `${baseUrl}/models/${params.model}:streamGenerateContent?key=${params.apiKey}&alt=sse`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildRequestBody(params)),
    signal: params.signal,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `Gemini API error (${response.status})`;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed?.error?.message ?? message;
    } catch {
      // Use the status-based message
    }
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error('Response body is null — streaming not supported');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();

        // SSE data lines start with "data: "
        if (!trimmed.startsWith('data: ')) continue;

        const jsonStr = trimmed.slice(6); // Remove "data: " prefix
        if (!jsonStr || jsonStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(jsonStr);

          // Extract text from candidates
          const candidates = parsed.candidates;
          if (candidates && candidates.length > 0) {
            const parts = candidates[0]?.content?.parts;
            if (parts && parts.length > 0) {
              const text = parts[0]?.text;
              if (text) {
                yield { type: 'chunk', text };
              }
            }
          }

          // Extract usage metadata if present
          const usageMetadata = parsed.usageMetadata;
          if (usageMetadata) {
            totalPromptTokens =
              usageMetadata.promptTokenCount ?? totalPromptTokens;
            totalCompletionTokens =
              usageMetadata.candidatesTokenCount ?? totalCompletionTokens;
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Yield final done event with usage
  yield {
    type: 'done',
    usage: {
      promptTokens: totalPromptTokens,
      completionTokens: totalCompletionTokens,
      totalTokens: totalPromptTokens + totalCompletionTokens,
    },
  };
}

/**
 * Send a prompt to Gemini without streaming (single response).
 *
 * Uses the `generateContent` endpoint for a complete response.
 */
export async function sendPrompt(
  params: PromptParams,
): Promise<AIServiceResponse> {
  const baseUrl = GEMINI_BASE_URL;
  const url = `${baseUrl}/models/${params.model}:generateContent?key=${params.apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildRequestBody(params)),
    signal: params.signal,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `Gemini API error (${response.status})`;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed?.error?.message ?? message;
    } catch {
      // Use the status-based message
    }
    throw new Error(message);
  }

  const data = await response.json();
  const candidates = data.candidates ?? [];
  const content =
    candidates[0]?.content?.parts?.[0]?.text ?? '';

  const usageMetadata = data.usageMetadata ?? {};
  const promptTokens = usageMetadata.promptTokenCount ?? 0;
  const completionTokens = usageMetadata.candidatesTokenCount ?? 0;

  return {
    content,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    model: params.model,
  };
}

/**
 * Test the API connection by listing available models.
 *
 * @returns An object indicating success or containing an error message.
 */
export async function testConnection(
  apiKey: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${GEMINI_BASE_URL}/models?key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorBody = await response.text();
      let message = `API error (${response.status})`;
      try {
        const parsed = JSON.parse(errorBody);
        message = parsed?.error?.message ?? message;
      } catch {
        // Use status-based message
      }
      return { success: false, error: message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown connection error',
    };
  }
}
