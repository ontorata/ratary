import type { ICandidateProvider } from './candidate-provider.port.js';
import { CandidateSetSchema, type CandidateSet, type RecallRequest } from './recall-contracts.js';
import {
  buildRecallCandidateMetadata,
  recallCandidateId,
  sortCandidatesDeterministically,
  toRecallCandidate,
} from './recall-candidate-mapper.js';

export type KnowledgeRecallRecord = {
  versionId: string;
  documentId: string;
  organizationId: string;
  version: string;
  status: 'pending' | 'available' | 'failed';
  embeddingCount: number;
  createdAt: string;
  updatedAt: string;
  sourceRef?: string;
  sourceType?: string;
  title?: string;
};

/**
 * Raw knowledge-store candidate provider. Organization scoping only — no ranking/scoring.
 */
export class KnowledgeCandidateProvider implements ICandidateProvider {
  readonly providerName = 'knowledge';

  constructor(private readonly listRecords: (organizationId: string) => KnowledgeRecallRecord[]) {}

  async provideCandidates(request: RecallRequest): Promise<CandidateSet> {
    const started = Date.now();
    const returned = this.listRecords(request.organizationId);
    const scoped = returned.filter(
      (record) => record.organizationId === request.organizationId && record.status === 'available',
    );

    const limit = request.limit ?? scoped.length;
    const limited = scoped.slice(0, limit);
    const candidates = sortCandidatesDeterministically(
      limited.map((record) => {
        const metadata = buildRecallCandidateMetadata({
          source: 'knowledge',
          sourceId: record.versionId,
          contentType: record.sourceType ?? 'knowledge',
          organizationId: record.organizationId,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          permissions: ['read'],
          embeddingVersion: record.embeddingCount > 0 ? record.version : undefined,
          tokenCount: undefined,
          provenance: 'knowledge-store-snapshot',
        });

        return toRecallCandidate(request, {
          candidateId: recallCandidateId('knowledge', [record.versionId, record.organizationId]),
          sourceType: record.sourceType ?? 'knowledge',
          sourceReference: record.sourceRef ?? record.documentId,
          metadata,
          documentId: record.documentId,
          versionId: record.versionId,
        });
      }),
    );

    return CandidateSetSchema.parse({
      requestId: request.requestId,
      organizationId: request.organizationId,
      candidates,
      generatedAt: new Date().toISOString(),
      providerName: this.providerName,
      providerLatencyMs: Date.now() - started,
      truncated: scoped.length > limited.length,
    });
  }
}
