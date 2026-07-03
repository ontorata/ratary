import type { D1Client } from '../db/d1-client.js';
import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';
import type { IEmbeddingProvider } from '../embedding/embedding.provider.interface.js';
import type { IEmbeddingStore } from '../embedding/embedding.store.interface.js';
import type { RegisteredRetrievalSource } from './retrieval-source.types.js';
import type { Env } from '../config/env.js';
import { ContextService } from './context.service.js';
import { SqlRetrievalCandidateSource } from './sql-retrieval-candidate-source.js';
import { VectorRetrievalCandidateSource } from './vector-retrieval-candidate-source.js';
import { CompositeRetrievalCandidateSource } from './composite-retrieval-candidate-source.js';
import { D1GraphAdapter } from '../graph/d1-graph.adapter.js';
import { GraphRetrievalCandidateSource } from '../graph/graph-retrieval-candidate-source.js';
import { getEnv } from '../config/index.js';

/**
 * Create a ContextService with optional hybrid and graph retrieval legs.
 *
 * Wiring matrix (ADR-006 Appendix E):
 * - HYBRID only → sql + vector composite
 * - GRAPH only → sql + graph composite
 * - Both → sql + vector + graph composite
 * - Neither → default SqlRetrievalCandidateSource inside ContextService
 */
export function createContextService(
  repository: IMemoryRepository,
  embeddingProvider?: IEmbeddingProvider,
  embeddingStore?: IEmbeddingStore,
  db?: D1Client,
): ContextService {
  const env = getEnv();
  const candidateSource = buildCompositeCandidateSource(
    repository,
    env,
    embeddingProvider,
    embeddingStore,
    db,
  );

  return new ContextService(repository, candidateSource);
}

function buildCompositeCandidateSource(
  repository: IMemoryRepository,
  env: Env,
  embeddingProvider?: IEmbeddingProvider,
  embeddingStore?: IEmbeddingStore,
  db?: D1Client,
): IRetrievalCandidateSource | undefined {
  const useVector = env.HYBRID_RETRIEVAL && embeddingProvider && embeddingStore;
  const useGraph = env.GRAPH_RETRIEVAL && db;

  if (!useVector && !useGraph) {
    return undefined;
  }

  const registered: RegisteredRetrievalSource[] = [
    { role: 'sql', source: new SqlRetrievalCandidateSource(repository) },
  ];

  if (useVector) {
    registered.push({
      role: 'vector',
      source: new VectorRetrievalCandidateSource(embeddingStore, embeddingProvider, repository),
    });
  }

  if (useGraph) {
    registered.push({
      role: 'graph',
      source: new GraphRetrievalCandidateSource(new D1GraphAdapter(db), repository, {
        seedCap: env.GRAPH_SEED_CAP,
        maxDepth: env.GRAPH_MAX_DEPTH,
        maxNeighbors: env.GRAPH_MAX_NEIGHBORS,
      }),
    });
  }

  return new CompositeRetrievalCandidateSource(registered);
}
