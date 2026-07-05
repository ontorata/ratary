import type { PrecisionSearchHit } from '../../types/precision-search.js';

export interface IReranker {
  rerank(query: string, candidates: PrecisionSearchHit[], topK: number): Promise<PrecisionSearchHit[]>;
}
