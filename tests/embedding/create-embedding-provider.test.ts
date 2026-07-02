import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetEnvCache } from '../../src/config/env.js';
import { createEmbeddingProvider } from '../../src/embedding/create-embedding-provider.js';
import { NoopEmbeddingProvider } from '../../src/embedding/noop-embedding.provider.js';
import { OpenAIEmbeddingProvider } from '../../src/embedding/openai-embedding.provider.js';

describe('createEmbeddingProvider', () => {
  beforeEach(() => {
    resetEnvCache();
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
    vi.stubEnv('D1_DATABASE_ID', 'test-database');
    vi.stubEnv('D1_API_TOKEN', 'test-token');
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterEach(() => {
    resetEnvCache();
    vi.unstubAllEnvs();
  });

  it('should return noop provider by default', () => {
    const provider = createEmbeddingProvider();
    expect(provider).toBeInstanceOf(NoopEmbeddingProvider);
  });

  it('should return OpenAI provider when configured', () => {
    vi.stubEnv('EMBEDDING_PROVIDER', 'openai');
    vi.stubEnv('EMBEDDING_API_KEY', 'test-openai-key');

    const provider = createEmbeddingProvider();
    expect(provider).toBeInstanceOf(OpenAIEmbeddingProvider);
  });

  it('should fail env validation when openai provider has no api key', () => {
    vi.stubEnv('EMBEDDING_PROVIDER', 'openai');
    vi.stubEnv('EMBEDDING_API_KEY', '');

    expect(() => createEmbeddingProvider()).toThrow(/EMBEDDING_API_KEY is required/i);
  });
});
