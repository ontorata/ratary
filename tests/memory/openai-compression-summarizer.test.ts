import { describe, it, expect, vi } from 'vitest';
import { OpenAICompressionSummarizer } from '../../src/memory/compression/openai-compression-summarizer.js';
import { generateSummary } from '../../src/knowledge/summary.generator.js';

describe('OpenAICompressionSummarizer', () => {
  it('returns LLM text normalized via generateSummary', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '  Concise factual summary.  ' } }],
      }),
    })) as unknown as typeof fetch;

    const summarizer = new OpenAICompressionSummarizer({
      apiKey: 'test-key',
      fetchImpl,
    });

    const result = await summarizer.summarize('Long body text here', { title: 'Test note' });

    expect(result).toBe(generateSummary('Concise factual summary.'));
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('falls back to rule-based summary when API fails', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: false,
      status: 503,
    })) as unknown as typeof fetch;

    const summarizer = new OpenAICompressionSummarizer({
      apiKey: 'test-key',
      fetchImpl,
    });

    const content = 'Important deployment note about staging rollback.';
    const result = await summarizer.summarize(content, { title: 'Rollback' });

    expect(result).toBe(generateSummary(content));
  });

  it('throws when api key is missing', () => {
    expect(() => new OpenAICompressionSummarizer({ apiKey: '' })).toThrow(
      /API key is required/i,
    );
  });
});
