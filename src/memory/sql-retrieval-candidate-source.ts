import type { IMemoryReader, RetrievalFilters } from '../repositories/memory.repository.interface.js';
import type { Memory } from '../types/memory.js';
import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';

/** SQL-backed retrieval candidate source (D1 today; Postgres later). */
export class SqlRetrievalCandidateSource implements IRetrievalCandidateSource {
  constructor(private readonly reader: IMemoryReader) {}

  findCandidates(filters: RetrievalFilters): Promise<Memory[]> {
    return this.reader.findRetrievalCandidates(filters);
  }
}
