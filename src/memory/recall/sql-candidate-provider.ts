import type { Memory } from '../../types/memory.js';
import type { MemoryLevel } from '../../types/memory-level.js';
import type { IRetrievalCandidateSource } from '../retrieval-candidate-source.interface.js';
import type { ICandidateProvider } from './candidate-provider.port.js';
import { CandidateSetSchema, type CandidateSet, type RecallRequest } from './recall-contracts.js';
import {
  buildRecallCandidateMetadata,
  recallCandidateId,
  sortCandidatesDeterministically,
  toRecallCandidate,
} from './recall-candidate-mapper.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function mapMemoryToCandidate(request: RecallRequest, memory: Memory) {
  const metadata = buildRecallCandidateMetadata({
    source: 'sql',
    sourceId: memory.id,
    contentType: memory.memoryType || 'memory',
    organizationId: request.organizationId,
    createdAt: memory.createdAt,
    updatedAt: memory.updatedAt,
    permissions: ['read'],
    embeddingVersion: memory.embeddingId ?? undefined,
    tokenCount: undefined,
    provenance: 'sql-retrieval-candidate-source',
  });

  return toRecallCandidate(request, {
    candidateId: recallCandidateId('sql', [memory.id, request.organizationId]),
    sourceType: 'memory',
    sourceReference: memory.sourcePath ?? memory.id,
    metadata,
    memoryId: memory.id,
  });
}

/**
 * Raw SQL-backed candidate provider. Fetch + tenant filter only — no ranking/scoring.
 */
export class SqlCandidateProvider implements ICandidateProvider {
  readonly providerName = 'sql';

  constructor(private readonly candidateSource: IRetrievalCandidateSource) {}

  async provideCandidates(request: RecallRequest): Promise<CandidateSet> {
    const started = Date.now();
    const limit = Math.min(request.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const fetched = await this.candidateSource.findCandidates({
      ownerId: request.organizationId,
      workspaceId: request.workspaceId,
      projectId: request.projectId,
      query: request.query,
      tags: request.tags,
      levels: request.levels as MemoryLevel[] | undefined,
      archived: false,
      maxCandidates: limit,
    });

    const scoped = fetched.filter((memory) => memory.ownerId === request.organizationId);
    const candidates = sortCandidatesDeterministically(
      scoped.map((memory) => mapMemoryToCandidate(request, memory)),
    );

    return CandidateSetSchema.parse({
      requestId: request.requestId,
      organizationId: request.organizationId,
      candidates,
      generatedAt: new Date().toISOString(),
      providerName: this.providerName,
      providerLatencyMs: Date.now() - started,
      truncated: scoped.length >= limit,
    });
  }
}
