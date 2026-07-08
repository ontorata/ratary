import { createHash } from 'node:crypto';
import type { RecallCandidate, RecallRequest } from './recall-contracts.js';
import { RecallCandidateMetadataSchema, type RecallCandidateMetadata } from './recall-contracts.js';

export function recallCandidateId(prefix: string, parts: string[]): string {
  const digest = createHash('sha256').update(parts.join(':')).digest('hex').slice(0, 16);
  return `cand-${prefix}-${digest}`;
}

export function buildRecallCandidateMetadata(
  input: RecallCandidateMetadata,
): RecallCandidateMetadata {
  return RecallCandidateMetadataSchema.parse(input);
}

export function toRecallCandidate(
  request: RecallRequest,
  input: {
    candidateId: string;
    sourceType: string;
    sourceReference: string;
    metadata: RecallCandidateMetadata;
    documentId?: string;
    versionId?: string;
    chunkId?: string;
    memoryId?: string;
  },
): RecallCandidate {
  return {
    candidateId: input.candidateId,
    organizationId: request.organizationId,
    sourceType: input.sourceType,
    sourceReference: input.sourceReference,
    signals: {},
    documentId: input.documentId,
    versionId: input.versionId,
    chunkId: input.chunkId,
    memoryId: input.memoryId,
    metadata: input.metadata,
  };
}

export function sortCandidatesDeterministically(candidates: RecallCandidate[]): RecallCandidate[] {
  return [...candidates].sort((left, right) => left.candidateId.localeCompare(right.candidateId));
}
