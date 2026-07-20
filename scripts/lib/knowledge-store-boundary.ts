import { createHash } from 'node:crypto';
import {
  IndexUpdateEventSchema,
  KnowledgeStoreRecordSchema,
  type EmbeddingRecord,
  type KnowledgeDocument,
  type IndexUpdateEvent,
  type KnowledgeStoreRecord,
} from './knowledge-ingestion-contracts.js';

export type KnowledgeStoreSnapshot = {
  records: KnowledgeStoreRecord[];
  embeddings: EmbeddingRecord[];
  indexEvents: IndexUpdateEvent[];
};

export type PersistOptions = {
  previous?: KnowledgeStoreSnapshot;
  failBeforeMarkAvailable?: boolean;
  /** Injectable clock for deterministic replay / tests. Defaults to wall clock. */
  now?: () => string;
};

export type PersistResult = {
  snapshot: KnowledgeStoreSnapshot;
  persistedEmbeddingCount: number;
  duplicateEmbeddingCount: number;
  pendingVersionIds: string[];
  availableVersionIds: string[];
  recoveryToken?: string;
  partialFailure: boolean;
};

function shortHash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function versionIdFor(document: KnowledgeDocument): string {
  return `kv-${shortHash(`${document.documentId}:${document.version}`)}`;
}

function indexEventIdFor(versionId: string): string {
  return `idx-${shortHash(versionId)}`;
}

function resolveNow(now?: () => string): string {
  return now?.() ?? new Date().toISOString();
}

export function createEmptySnapshot(): KnowledgeStoreSnapshot {
  return { records: [], embeddings: [], indexEvents: [] };
}

export function persistKnowledgeArtifacts(
  documents: KnowledgeDocument[],
  embeddings: EmbeddingRecord[],
  options?: PersistOptions,
): PersistResult {
  const previous = options?.previous ?? createEmptySnapshot();
  const clock = () => resolveNow(options?.now);
  const recordMap = new Map(previous.records.map((record) => [record.versionId, record] as const));
  const embeddingMap = new Map(previous.embeddings.map((record) => [record.embeddingId, record] as const));
  const indexEventMap = new Map(previous.indexEvents.map((event) => [event.eventId, event] as const));

  let persistedEmbeddingCount = 0;
  let duplicateEmbeddingCount = 0;

  for (const document of documents) {
    const versionId = versionIdFor(document);
    if (!recordMap.has(versionId)) {
      recordMap.set(
        versionId,
        KnowledgeStoreRecordSchema.parse({
          versionId,
          documentId: document.documentId,
          organizationId: document.organizationId,
          version: document.version,
          status: 'pending',
          embeddingCount: 0,
          createdAt: clock(),
          updatedAt: clock(),
        }),
      );
    }
  }

  for (const embedding of embeddings) {
    if (embeddingMap.has(embedding.embeddingId)) {
      duplicateEmbeddingCount += 1;
      continue;
    }
    embeddingMap.set(embedding.embeddingId, embedding);
    persistedEmbeddingCount += 1;
  }

  const pendingVersionIds: string[] = [];
  const availableVersionIds: string[] = [];
  const versionByDoc = new Map(documents.map((doc) => [doc.documentId, doc.version]));
  for (const record of recordMap.values()) {
    const expectedVersion = versionByDoc.get(record.documentId);
    if (!expectedVersion) continue;
    if (expectedVersion !== record.version) continue;

    const embeddingCount = Array.from(embeddingMap.values()).filter(
      (embedding) => embedding.documentId === record.documentId && embedding.version === record.version,
    ).length;

    const shouldBeAvailable = embeddingCount > 0 && !options?.failBeforeMarkAvailable;
    const status = shouldBeAvailable ? 'available' : 'pending';
    const recoveryToken = shouldBeAvailable ? undefined : `recovery-${shortHash(record.versionId)}`;
    const updated = KnowledgeStoreRecordSchema.parse({
      ...record,
      status,
      embeddingCount,
      recoveryToken,
      updatedAt: clock(),
    });
    recordMap.set(record.versionId, updated);

    if (status === 'available') {
      availableVersionIds.push(record.versionId);
      const eventId = indexEventIdFor(record.versionId);
      indexEventMap.set(
        eventId,
        IndexUpdateEventSchema.parse({
          eventId,
          versionId: record.versionId,
          documentId: record.documentId,
          organizationId: record.organizationId,
          status: 'pending',
          createdAt: clock(),
        }),
      );
      continue;
    }
    pendingVersionIds.push(record.versionId);
  }

  return {
    snapshot: {
      records: Array.from(recordMap.values()),
      embeddings: Array.from(embeddingMap.values()),
      indexEvents: Array.from(indexEventMap.values()),
    },
    persistedEmbeddingCount,
    duplicateEmbeddingCount,
    pendingVersionIds,
    availableVersionIds,
    recoveryToken: pendingVersionIds.length > 0 ? `restore-${shortHash(pendingVersionIds.join(':'))}` : undefined,
    partialFailure: pendingVersionIds.length > 0,
  };
}

export function recoverPendingVersions(snapshot: KnowledgeStoreSnapshot): KnowledgeStoreSnapshot {
  const records = snapshot.records.map((record) =>
    record.status === 'pending'
      ? KnowledgeStoreRecordSchema.parse({
          ...record,
          status: 'available',
          recoveryToken: undefined,
          updatedAt: resolveNow(),
        })
      : record,
  );
  const indexEvents = [...snapshot.indexEvents];
  for (const record of records) {
    if (record.status !== 'available') continue;
    const eventId = indexEventIdFor(record.versionId);
    if (indexEvents.some((event) => event.eventId === eventId)) continue;
    indexEvents.push(
      IndexUpdateEventSchema.parse({
        eventId,
        versionId: record.versionId,
        documentId: record.documentId,
        organizationId: record.organizationId,
        status: 'pending',
        createdAt: resolveNow(),
      }),
    );
  }

  return { records, embeddings: snapshot.embeddings, indexEvents };
}

export function applyIndexUpdateBoundary(snapshot: KnowledgeStoreSnapshot): KnowledgeStoreSnapshot {
  return applyIndexUpdateBoundaryWithOptions(snapshot);
}

export type IndexUpdateOptions = {
  failVersionIds?: string[];
};

export function applyIndexUpdateBoundaryWithOptions(
  snapshot: KnowledgeStoreSnapshot,
  options?: IndexUpdateOptions,
): KnowledgeStoreSnapshot {
  const failVersionIds = new Set(options?.failVersionIds ?? []);
  const indexEvents = snapshot.indexEvents.map((event) =>
    event.status === 'pending'
      ? IndexUpdateEventSchema.parse({
          ...event,
          status: failVersionIds.has(event.versionId) ? 'failed' : 'completed',
          completedAt: failVersionIds.has(event.versionId) ? undefined : resolveNow(),
          error: failVersionIds.has(event.versionId) ? 'index update failed, recovery required' : undefined,
        })
      : event,
  );
  return { records: snapshot.records, embeddings: snapshot.embeddings, indexEvents };
}

export function buildIndexRecoveryQueue(snapshot: KnowledgeStoreSnapshot): string[] {
  return snapshot.indexEvents.filter((event) => event.status === 'failed').map((event) => event.versionId);
}
