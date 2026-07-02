import { getEnv } from '../config/env.js';
import type { IEmbeddingProvider } from './embedding.provider.interface.js';
import { NoopEmbeddingProvider } from './noop-embedding.provider.js';
import { OpenAIEmbeddingProvider } from './openai-embedding.provider.js';

export function createEmbeddingProvider(): IEmbeddingProvider {
  const env = getEnv();

  if (env.EMBEDDING_PROVIDER === 'openai') {
    if (!env.EMBEDDING_API_KEY) {
      throw new Error('EMBEDDING_API_KEY is required when EMBEDDING_PROVIDER=openai');
    }

    return new OpenAIEmbeddingProvider({
      apiKey: env.EMBEDDING_API_KEY,
      modelId: env.EMBEDDING_MODEL,
      baseUrl: env.EMBEDDING_BASE_URL,
    });
  }

  return new NoopEmbeddingProvider();
}
