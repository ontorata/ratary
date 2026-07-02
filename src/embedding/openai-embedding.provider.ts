import type {
  EmbeddingInput,
  EmbeddingResult,
  IEmbeddingProvider,
} from './embedding.provider.interface.js';

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_OPENAI_MODEL = 'text-embedding-3-small';
const DEFAULT_OPENAI_DIMENSIONS = 1536;

interface OpenAIEmbeddingsResponse {
  data: Array<{ embedding: number[]; index: number }>;
}

export interface OpenAIEmbeddingProviderOptions {
  apiKey: string;
  modelId?: string;
  baseUrl?: string;
  dimensions?: number;
  fetchImpl?: typeof fetch;
}

export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
  readonly modelId: string;
  readonly dimensions: number;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OpenAIEmbeddingProviderOptions) {
    if (!options.apiKey) {
      throw new Error('EMBEDDING_API_KEY is required for OpenAIEmbeddingProvider');
    }

    this.apiKey = options.apiKey;
    this.modelId = options.modelId ?? DEFAULT_OPENAI_MODEL;
    this.dimensions = options.dimensions ?? DEFAULT_OPENAI_DIMENSIONS;
    this.baseUrl = (options.baseUrl ?? DEFAULT_OPENAI_BASE_URL).replace(/\/$/, '');
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async embed(inputs: EmbeddingInput[]): Promise<EmbeddingResult[]> {
    if (inputs.length === 0) {
      return [];
    }

    const response = await this.fetchImpl(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        input: inputs.map((input) => input.text),
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI embeddings request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as OpenAIEmbeddingsResponse;
    const sorted = [...payload.data].sort((a, b) => a.index - b.index);

    return sorted.map((item, index) => {
      const memoryId = inputs[index]?.memoryId;
      if (!memoryId) {
        throw new Error('OpenAI embeddings response index mismatch');
      }

      if (item.embedding.length !== this.dimensions) {
        throw new Error(
          `OpenAI embedding dimension mismatch: expected ${this.dimensions}, got ${item.embedding.length}`,
        );
      }

      return {
        memoryId,
        vector: item.embedding,
        modelId: this.modelId,
        dimensions: this.dimensions,
      };
    });
  }
}
