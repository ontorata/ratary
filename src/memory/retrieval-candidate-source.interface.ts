import type { Memory } from '../types/memory.js';
import type { RetrievalFilters } from '../repositories/memory.repository.interface.js';

/**
 * Port for fetching retrieval candidates from one or more backends (SQL, vector, graph).
 */
export interface IRetrievalCandidateSource {
  findCandidates(filters: RetrievalFilters): Promise<Memory[]>;
}
