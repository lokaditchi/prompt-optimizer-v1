/**
 * Model Registry Pattern implementation for PromptForge.
 * 
 * Provides type-safe definitions, provider classification, pricing indexes, 
 * and routing rules for AI models.
 */

export interface ModelMetadata {
  id: string;
  name: string;
  provider: 'google' | 'openrouter';
  isFree: boolean;
  pricing: {
    inputPerToken: number;
    outputPerToken: number;
  };
}

export class ModelRegistry {
  private static registry: Map<string, ModelMetadata> = new Map();

  static {
    // Register Google Gemini models
    this.register({
      id: 'gemini-3.5-flash',
      name: 'Gemini 3.5 Flash',
      provider: 'google',
      isFree: false,
      pricing: { inputPerToken: 0.000_000_075, outputPerToken: 0.000_000_3 },
    });

    this.register({
      id: 'gemini-3.1-pro',
      name: 'Gemini 3.1 Pro',
      provider: 'google',
      isFree: false,
      pricing: { inputPerToken: 0.000_001_25, outputPerToken: 0.000_01 },
    });

    this.register({
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      provider: 'google',
      isFree: false,
      pricing: { inputPerToken: 0.000_000_075, outputPerToken: 0.000_000_3 },
    });

    this.register({
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'google',
      isFree: false,
      pricing: { inputPerToken: 0.000_000_15, outputPerToken: 0.000_000_6 },
    });

    this.register({
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'google',
      isFree: false,
      pricing: { inputPerToken: 0.000_001_25, outputPerToken: 0.000_01 },
    });

    // Register OpenRouter models
    this.register({
      id: 'google/gemma-4-31b-it:free',
      name: 'Gemma 4 31B (Free)',
      provider: 'openrouter',
      isFree: true,
      pricing: { inputPerToken: 0, outputPerToken: 0 },
    });
  }

  /**
   * Register a new model definition.
   */
  public static register(metadata: ModelMetadata): void {
    this.registry.set(metadata.id, metadata);
  }

  /**
   * Retrieve metadata for a model.
   */
  public static get(id: string): ModelMetadata | undefined {
    return this.registry.get(id);
  }

  /**
   * Get all registered models.
   */
  public static getAll(): ModelMetadata[] {
    return Array.from(this.registry.values());
  }

  /**
   * Get all model IDs.
   */
  public static getIds(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Check if a model is hosted on OpenRouter.
   */
  public static isOpenRouter(id: string): boolean {
    const model = this.get(id);
    return model?.provider === 'openrouter' || id.includes('/');
  }
}
