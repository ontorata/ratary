import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';
import type { IEmbeddingProvider } from '../embedding/embedding.provider.interface.js';
import type { IEmbeddingStore } from '../embedding/embedding.store.interface.js';
import { ContextService } from './context.service.js';
import { SqlRetrievalCandidateSource } from './sql-retrieval-candidate-source.js';
import { VectorRetrievalCandidateSource } from './vector-retrieval-candidate-source.js';
import { CompositeRetrievalCandidateSource } from './composite-retrieval-candidate-source.js';
import { getEnv } from '../config/index.js';

/**
 * Create a ContextService with optional hybrid retrieval support.
 *
 * When HYBRID_RETRIEVAL=true, wraps SQL and vector sources in a CompositeRetrievalCandidateSource
 * using Reciprocal Rank Fusion (RRF) to merge ranked candidates.
 */
export function createContextService(
  repository: IMemoryRepository,
  embeddingProvider?: IEmbeddingProvider,
  embeddingStore?: IEmbeddingStore,
): ContextService {
  const env = getEnv();

  let candidateSource: IRetrievalCandidateSource | undefined;

  if (env.HYBRID_RETRIEVAL && embeddingProvider && embeddingStore) {
    // Hybrid mode: composite SQL + vector with RRF
    const sqlSource = new SqlRetrievalCandidateSource(repository);
    const vectorSource = new VectorRetrievalCandidateSource(
      embeddingStore,
      embeddingProvider,
      repository,
    );
    candidateSource = new CompositeRetrievalCandidateSource([
      { role: 'sql', source: sqlSource },
      { role: 'vector', source: vectorSource },
    ]);
  }

  return new ContextService(repository, candidateSource);
}
