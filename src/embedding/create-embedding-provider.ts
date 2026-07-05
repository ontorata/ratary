import { getEnv } from '../config/env.js';
import type { IUsageMeter } from '../cloud/ports/iusage-meter.port.js';
import { NoOpUsageMeter } from '../cloud/adapters/noop-usage-meter.js';
import { UsageMeterEmbeddingProvider } from '../cloud/adapters/usage-meter-embedding-provider.js';
import type { IEmbeddingProvider } from './embedding.provider.interface.js';
import { NoopEmbeddingProvider } from './noop-embedding.provider.js';
import { OpenAIEmbeddingProvider } from './openai-embedding.provider.js';
import { LocalEmbeddingProvider } from './local-embedding.provider.js';

export interface CreateEmbeddingProviderOptions {
  usageMeter?: IUsageMeter;
  usageMeterEnabled?: boolean;
}

export function createEmbeddingProvider(
  options: CreateEmbeddingProviderOptions = {},
): IEmbeddingProvider {
  const env = getEnv();
  let provider: IEmbeddingProvider;

  if (env.EMBEDDING_PROVIDER === 'openai') {
    if (!env.EMBEDDING_API_KEY) {
      throw new Error('EMBEDDING_API_KEY is required when EMBEDDING_PROVIDER=openai');
    }

    provider = new OpenAIEmbeddingProvider({
      apiKey: env.EMBEDDING_API_KEY,
      modelId: env.EMBEDDING_MODEL,
      baseUrl: env.EMBEDDING_BASE_URL,
    });
  } else if (env.EMBEDDING_PROVIDER === 'local') {
    provider = new LocalEmbeddingProvider({ modelId: env.EMBEDDING_MODEL });
  } else {
    provider = new NoopEmbeddingProvider();
  }

  const meter = options.usageMeter;
  if (options.usageMeterEnabled && meter && !(meter instanceof NoOpUsageMeter)) {
    return new UsageMeterEmbeddingProvider(provider, meter);
  }

  return provider;
}
