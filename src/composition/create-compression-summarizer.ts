import type { Env } from '../config/env.js';
import type { ICompressionSummarizer } from '../memory/compression/compression-summarizer.interface.js';
import { OpenAICompressionSummarizer } from '../memory/compression/openai-compression-summarizer.js';
import { RuleBasedCompressionSummarizer } from '../memory/compression/rule-based-compression-summarizer.js';

const ruleSummarizer = new RuleBasedCompressionSummarizer();

/** Resolves async summarizer from env (`COMPRESSION_POLICY=rule|llm`). */
export function createCompressionSummarizer(env: Env): ICompressionSummarizer {
  if (env.COMPRESSION_POLICY !== 'llm') {
    return ruleSummarizer;
  }

  const apiKey = env.SUMMARIZER_API_KEY ?? env.EMBEDDING_API_KEY;
  if (!apiKey) {
    return ruleSummarizer;
  }

  return new OpenAICompressionSummarizer({
    apiKey,
    modelId: env.SUMMARIZER_MODEL,
    baseUrl: env.SUMMARIZER_BASE_URL,
  });
}
