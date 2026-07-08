import type { KnowledgeStoreSnapshot } from './knowledge-store-boundary.js';

export type ContextRequest = {
  identityId: string;
  organizationId: string;
  documentId?: string;
};

export type ContextPackage = {
  identityId: string;
  organizationId: string;
  versionIds: string[];
  embeddingIds: string[];
  recordCount: number;
  embeddingCount: number;
};

export function resolveContextPackage(
  snapshot: KnowledgeStoreSnapshot,
  request: ContextRequest,
): ContextPackage {
  const records = snapshot.records.filter(
    (record) =>
      record.organizationId === request.organizationId &&
      record.status === 'available' &&
      (!request.documentId || record.documentId === request.documentId),
  );
  const versionIdSet = new Set(records.map((record) => record.versionId));

  const embeddings = snapshot.embeddings.filter(
    (embedding) =>
      embedding.organizationId === request.organizationId &&
      (!request.documentId || embedding.documentId === request.documentId),
  );

  return {
    identityId: request.identityId,
    organizationId: request.organizationId,
    versionIds: Array.from(versionIdSet.values()),
    embeddingIds: embeddings.map((embedding) => embedding.embeddingId),
    recordCount: records.length,
    embeddingCount: embeddings.length,
  };
}
