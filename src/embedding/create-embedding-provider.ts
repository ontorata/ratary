import { getEnv } from '../config/env.js';
import type { IEmbeddingProvider } from './embedding.provider.interface.js';
import { NoopEmbeddingProvider } from './noop-embedding.provider.js';
import { OpenAIEmbeddingProvider } from './openai-embedding.provider.js';
import { LocalEmbeddingProvider } from './local-embedding.provider.js';

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

  if (env.EMBEDDING_PROVIDER === 'local') {
    return new LocalEmbeddingProvider({ modelId: env.EMBEDDING_MODEL });
  }

  return new NoopEmbeddingProvider();
}
