/**
 * Template types for the built-in and user-created prompt template library.
 */

import type { ModelParameters, Placeholder } from './prompt';

/** Available template categories for organization. */
export type TemplateCategory =
  | 'code-generation'
  | 'debugging'
  | 'code-review'
  | 'refactoring'
  | 'documentation'
  | 'testing'
  | 'architecture'
  | 'general';

/** A reusable prompt template that can be instantiated into a new prompt. */
export interface Template {
  /** Unique identifier for this template. */
  id: string;
  /** Display name of the template. */
  name: string;
  /** Classification category. */
  category: TemplateCategory;
  /** Human-readable description of what this template does. */
  description: string;
  /** The prompt template content, potentially containing {{placeholders}}. */
  content: string;
  /** Default system message for prompts created from this template. */
  systemMessage: string;
  /** Declared placeholders with their metadata. */
  placeholders: Placeholder[];
  /** Default model parameters for prompts created from this template. */
  defaultParameters: ModelParameters;
  /** Whether this template is shipped with the app (true) or user-created. */
  isBuiltIn: boolean;
  /** Number of times this template has been used to create a prompt. */
  usageCount: number;
  /** Lucide icon name for display (e.g. 'code', 'bug', 'file-text'). */
  icon: string;
}
