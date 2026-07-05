import { describe, it, expect, vi } from 'vitest';
import { OpenAIEmbeddingProvider } from '../../src/embedding/openai-embedding.provider.js';

describe('OpenAIEmbeddingProvider', () => {
  it('should call OpenAI embeddings API and map results', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: [
          { index: 0, embedding: [1, 0, 0] },
          { index: 1, embedding: [0, 1, 0] },
        ],
      }),
    })) as unknown as typeof fetch;

    const provider = new OpenAIEmbeddingProvider({
      apiKey: 'test-key',
      modelId: 'text-embedding-3-small',
      dimensions: 3,
      fetchImpl,
    });

    const results = await provider.embed([
      { memoryId: 'mem-1', text: 'hello' },
      { memoryId: 'mem-2', text: 'world' },
    ]);

    expect(results).toEqual([
      { memoryId: 'mem-1', vector: [1, 0, 0], modelId: 'text-embedding-3-small', dimensions: 3 },
      { memoryId: 'mem-2', vector: [0, 1, 0], modelId: 'text-embedding-3-small', dimensions: 3 },
    ]);

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.openai.com/v1/embeddings',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
        }),
      }),
    );
  });

  it('should return empty array for empty batch', async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const provider = new OpenAIEmbeddingProvider({
      apiKey: 'test-key',
      dimensions: 3,
      fetchImpl,
    });

    await expect(provider.embed([])).resolves.toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('should throw sanitized error when API request fails', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: false,
      status: 401,
      text: async () => 'invalid key sk-secret',
    })) as unknown as typeof fetch;

    const provider = new OpenAIEmbeddingProvider({
      apiKey: 'sk-secret',
      dimensions: 3,
      fetchImpl,
    });

    await expect(provider.embed([{ memoryId: 'mem-1', text: 'hello' }])).rejects.toThrow(
      'OpenAI embeddings request failed with status 401',
    );
  });

  it('should require api key in constructor', () => {
    expect(() => new OpenAIEmbeddingProvider({ apiKey: '' })).toThrow(
      /EMBEDDING_API_KEY is required/i,
    );
  });
});
