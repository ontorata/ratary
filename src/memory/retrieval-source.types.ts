import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';

/** Role tag for RRF cap/weight lookup — order in composite array is irrelevant (ADR-006). */
export type RetrievalSourceRole = 'sql' | 'vector' | 'graph' | 'entity';

export interface RegisteredRetrievalSource {
  role: RetrievalSourceRole;
  source: IRetrievalCandidateSource;
}
