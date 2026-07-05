import type { PrecisionSearchHit } from '../../types/precision-search.js';
import type { IReranker } from './ireranker.port.js';

export class NoopReranker implements IReranker {
  async rerank(
    _query: string,
    candidates: PrecisionSearchHit[],
    topK: number,
  ): Promise<PrecisionSearchHit[]> {
    return candidates.slice(0, topK);
  }
}
