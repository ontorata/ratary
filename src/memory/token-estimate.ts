/**
 * Heuristic token estimate for English/code markdown (no external tokenizer).
 * OpenAI-style corpora average ~4 chars/token for mixed code prose.
 */
export function estimateTokens(text: string): number {
  if (text.length === 0) return 0;
  const words = text.trim().split(/\s+/).length;
  const charBased = Math.ceil(text.length / 4);
  const wordBased = Math.ceil(words * 1.3);
  return Math.max(1, Math.ceil((charBased + wordBased) / 2));
}

export function reductionPercent(baseline: number, optimized: number): number {
  if (baseline <= 0) return 0;
  return Math.round((1 - optimized / baseline) * 1000) / 10;
}
