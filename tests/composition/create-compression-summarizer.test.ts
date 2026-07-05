import { describe, it, expect } from 'vitest';
import { createCompressionSummarizer } from '../../src/composition/create-compression-summarizer.js';
import { OpenAICompressionSummarizer } from '../../src/memory/compression/openai-compression-summarizer.js';
import { RuleBasedCompressionSummarizer } from '../../src/memory/compression/rule-based-compression-summarizer.js';
import type { Env } from '../../src/config/env.js';

function baseEnv(overrides: Partial<Env> = {}): Env {
  return {
    COMPRESSION_POLICY: 'rule',
    SUMMARIZER_API_KEY: undefined,
    SUMMARIZER_MODEL: 'gpt-4o-mini',
    SUMMARIZER_BASE_URL: undefined,
    EMBEDDING_API_KEY: undefined,
    ...overrides,
  } as Env;
}

describe('createCompressionSummarizer', () => {
  it('returns rule-based summarizer by default', () => {
    const summarizer = createCompressionSummarizer(baseEnv());
    expect(summarizer).toBeInstanceOf(RuleBasedCompressionSummarizer);
    expect(summarizer.algorithmId).toBe('rule_v1');
  });

  it('returns OpenAI summarizer when COMPRESSION_POLICY=llm and key present', () => {
    const summarizer = createCompressionSummarizer(
      baseEnv({ COMPRESSION_POLICY: 'llm', SUMMARIZER_API_KEY: 'sk-test' }),
    );
    expect(summarizer).toBeInstanceOf(OpenAICompressionSummarizer);
  });

  it('falls back to rule-based when llm policy has no api key', () => {
    const summarizer = createCompressionSummarizer(baseEnv({ COMPRESSION_POLICY: 'llm' }));
    expect(summarizer).toBeInstanceOf(RuleBasedCompressionSummarizer);
  });

  it('uses EMBEDDING_API_KEY when SUMMARIZER_API_KEY is unset', () => {
    const summarizer = createCompressionSummarizer(
      baseEnv({ COMPRESSION_POLICY: 'llm', EMBEDDING_API_KEY: 'embed-key' }),
    );
    expect(summarizer).toBeInstanceOf(OpenAICompressionSummarizer);
  });
});
