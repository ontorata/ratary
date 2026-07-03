import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';
import type { IEmbeddingProvider } from '../embedding/embedding.provider.interface.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { IVectorStore } from '../ports/vector/ivector-store.port.js';
import type { IGraphProvider } from '../graph/igraph-provider.interface.js';
import type { RegisteredRetrievalSource } from './retrieval-source.types.js';
import type { Env } from '../config/env.js';
import type { IMemoryAccessAuditor } from '../ports/audit/imemory-access-auditor.port.js';
import { ContextService } from './context.service.js';
import { VectorRetrievalCandidateSource } from './vector-retrieval-candidate-source.js';
import { CompositeRetrievalCandidateSource } from './composite-retrieval-candidate-source.js';
import { GraphRetrievalCandidateSource } from '../graph/graph-retrieval-candidate-source.js';
import { getEnv } from '../config/index.js';
import { createLexicalRetrievalSource } from '../infrastructure/composition/create-lexical-retrieval-source.js';
import { createGraphProvider } from '../infrastructure/composition/create-graph-provider.js';

export interface ContextServicePlatformDeps {
  embeddingProvider?: IEmbeddingProvider;
  vectorStore?: IVectorStore;
  sql?: ISqlDatabase;
  graphProvider?: IGraphProvider;
  memoryAccessAuditor?: IMemoryAccessAuditor;
}

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
  platform?: ContextServicePlatformDeps,
): ContextService {
  const env = getEnv();
  const candidateSource = buildCompositeCandidateSource(repository, env, platform);

  return new ContextService(repository, candidateSource, platform?.memoryAccessAuditor);
}

function buildCompositeCandidateSource(
  repository: IMemoryRepository,
  env: Env,
  platform?: ContextServicePlatformDeps,
): IRetrievalCandidateSource | undefined {
  const useVector = env.HYBRID_RETRIEVAL && platform?.embeddingProvider && platform?.vectorStore;
  const useGraph = env.GRAPH_RETRIEVAL && platform?.sql;

  if (!useVector && !useGraph && env.SEARCH_PROVIDER === 'sql') {
    return undefined;
  }

  const registered: RegisteredRetrievalSource[] = [
    { role: 'sql', source: createLexicalRetrievalSource(env, repository) },
  ];

  if (useVector) {
    registered.push({
      role: 'vector',
      source: new VectorRetrievalCandidateSource(
        platform!.vectorStore!,
        platform!.embeddingProvider!,
        repository,
      ),
    });
  }

  if (useGraph) {
    const graphProvider = platform?.graphProvider ?? createGraphProvider(env, platform!.sql!);
    registered.push({
      role: 'graph',
      source: new GraphRetrievalCandidateSource(graphProvider, repository, {
        seedCap: env.GRAPH_SEED_CAP,
        maxDepth: env.GRAPH_MAX_DEPTH,
        maxNeighbors: env.GRAPH_MAX_NEIGHBORS,
      }),
    });
  }

  if (registered.length === 1 && env.SEARCH_PROVIDER === 'sql') {
    return undefined;
  }

  return new CompositeRetrievalCandidateSource(registered);
}
