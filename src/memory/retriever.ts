import type { RetrievalFilters } from '../repositories/memory.repository.interface.js';
import type { MemoryScope } from '../types/memory-scope.js';
import { workspaceIdFromScope } from '../repositories/repository-scope.js';
import type { MemoryLevel } from '../types/memory-level.js';
import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';
import { RETRIEVAL_CANDIDATE_CAP, RETRIEVAL_SQL_CAP } from '../search/ranking.config.js';

export interface RetrievalRequest {
  scope: MemoryScope;
  projectId?: string;
  query?: string;
  tags?: string[];
  levels?: MemoryLevel[];
  limit?: number;
}

const DEFAULT_RETRIEVE_LIMIT = 20;
const MAX_RETRIEVE_LIMIT = 50;

export class Retriever {
  constructor(private readonly candidateSource: IRetrievalCandidateSource) {}

  async retrieve(request: RetrievalRequest): Promise<import('../types/memory.js').Memory[]> {
    const limit = Math.min(request.limit ?? DEFAULT_RETRIEVE_LIMIT, MAX_RETRIEVE_LIMIT);
    const maxCandidates = Math.min(
      Math.max(limit * 3, limit),
      RETRIEVAL_SQL_CAP,
      RETRIEVAL_CANDIDATE_CAP,
    );

    const filters: RetrievalFilters = {
      ownerId: request.scope.ownerId,
      workspaceId: workspaceIdFromScope(request.scope),
      projectId: request.projectId,
      query: request.query,
      tags: request.tags,
      levels: request.levels,
      archived: false,
      maxCandidates,
    };

    return this.candidateSource.findCandidates(filters);
  }
}
