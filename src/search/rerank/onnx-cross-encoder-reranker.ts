import type { PrecisionSearchHit } from '../../types/precision-search.js';
import type { IReranker } from './ireranker.port.js';

/**
 * Lightweight lexical reranker used when ONNX model is unavailable.
 * Reorders by title/summary/snippet overlap with the query.
 */
export class LexicalCrossEncoderReranker implements IReranker {
  async rerank(
    query: string,
    candidates: PrecisionSearchHit[],
    topK: number,
  ): Promise<PrecisionSearchHit[]> {
    const q = query.trim().toLowerCase();
    if (!q) return candidates.slice(0, topK);

    const reranked = [...candidates].sort((a, b) => {
      const scoreA = this.scoreHit(a, q);
      const scoreB = this.scoreHit(b, q);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0);
    });

    return reranked.slice(0, topK);
  }

  private scoreHit(hit: PrecisionSearchHit, query: string): number {
    let score = hit.relevanceScore ?? 0;
    if (hit.title.toLowerCase().includes(query)) score += 50;
    if (hit.summary.toLowerCase().includes(query)) score += 30;
    if (hit.snippet?.toLowerCase().includes(query)) score += 20;
    for (const alias of hit.aliases) {
      if (alias.toLowerCase().includes(query)) score += 40;
    }
    return score;
  }
}

export class OnnxCrossEncoderReranker extends LexicalCrossEncoderReranker {
  constructor(private readonly modelPath?: string) {
    super();
  }

  /** ONNX runtime hook — falls back to lexical rerank until model loader lands. */
  override async rerank(
    query: string,
    candidates: PrecisionSearchHit[],
    topK: number,
  ): Promise<PrecisionSearchHit[]> {
    if (!this.modelPath) {
      return super.rerank(query, candidates, topK);
    }
    return super.rerank(query, candidates, topK);
  }
}
