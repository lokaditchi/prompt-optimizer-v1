/**
 * Core prompt and version types for PromptForge.
 * These types model the prompt authoring and versioning system.
 */

/** A dynamic placeholder within a prompt template. */
export interface Placeholder {
  /** Unique key matching the {{key}} pattern in the prompt content. */
  key: string;
  /** Default value to pre-fill when the placeholder is rendered. */
  defaultValue: string;
  /** Human-readable description of what this placeholder expects. */
  description: string;
  /** Input type determining the UI control used to collect the value. */
  type: 'text' | 'select' | 'number';
  /** Available options when type is 'select'. */
  options?: string[];
}

/** Configuration parameters sent to the AI model. */
export interface ModelParameters {
  /** The model identifier (e.g. 'gemini-2.0-flash'). */
  model: string;
  /** Sampling temperature (0–2). Higher values produce more creative output. */
  temperature: number;
  /** Maximum number of tokens to generate in the response. */
  maxTokens: number;
  /** Nucleus sampling threshold (0–1). */
  topP: number;
  /** Penalizes tokens based on their frequency in the text so far (-2 to 2). */
  frequencyPenalty: number;
  /** Penalizes tokens based on whether they appear in the text so far (-2 to 2). */
  presencePenalty: number;
}

/** An immutable snapshot of a prompt at a specific point in time. */
export interface PromptVersion {
  /** Unique identifier for this version. */
  id: string;
  /** The parent prompt this version belongs to. */
  promptId: string;
  /** Monotonically increasing version number (1-based). */
  versionNumber: number;
  /** The prompt template content, potentially containing {{placeholders}}. */
  content: string;
  /** System-level instruction sent before the user prompt. */
  systemMessage: string;
  /** Declared placeholders with their metadata. */
  placeholders: Placeholder[];
  /** Model generation parameters for this version. */
  parameters: ModelParameters;
  /** Human-readable note describing what changed in this version. */
  changeNote: string;
  /** ISO 8601 timestamp of when this version was created. */
  createdAt: string;
}

/** A named prompt project that tracks its version history. */
export interface Prompt {
  /** Unique identifier for this prompt. */
  id: string;
  /** Display name. */
  name: string;
  /** Optional longer description of the prompt's purpose. */
  description: string;
  /** ID of the currently active version. */
  currentVersionId: string;
  /** User-assigned tags for organization and filtering. */
  tags: string[];
  /** ISO 8601 timestamp of when this prompt was first created. */
  createdAt: string;
  /** ISO 8601 timestamp of the last modification. */
  updatedAt: string;
}
