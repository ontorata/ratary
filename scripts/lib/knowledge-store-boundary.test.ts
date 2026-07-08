import { describe, expect, it } from 'vitest';
import type { EmbeddingRecord, KnowledgeDocument } from './knowledge-ingestion-contracts.js';
import {
  applyIndexUpdateBoundary,
  createEmptySnapshot,
  persistKnowledgeArtifacts,
  recoverPendingVersions,
} from './knowledge-store-boundary.js';

const FIXED_TIME = '2026-07-08T06:00:00.000Z';

function document(version: string, digest: string): KnowledgeDocument {
  return {
    documentId: 'doc-governance',
    organizationId: 'org-ontorata',
    sourceType: 'governance',
    sourceRef: '.ai/core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md',
    title: 'Implementation Completion Protocol',
    content: 'Implementation is incomplete until docs are synchronized.',
    contentDigest: digest,
    version,
    ingestedAt: FIXED_TIME,
  };
}

function embedding(version: string, id: string): EmbeddingRecord {
  return {
    embeddingId: id,
    chunkId: `chunk-${version}`,
    documentId: 'doc-governance',
    organizationId: 'org-ontorata',
    version,
    model: 'deterministic-local-v1',
    vectorDigest: `vec-${id}`,
    createdAt: FIXED_TIME,
    dimensions: 64,
  };
}

describe('knowledge store boundary', () => {
  it('maintains version integrity between v1 and v2 artifacts', () => {
    const resultV1 = persistKnowledgeArtifacts([document('v1', 'digest-v1')], [embedding('v1', 'emb-v1')]);
    const resultV2 = persistKnowledgeArtifacts([document('v2', 'digest-v2')], [embedding('v1', 'emb-v1')], {
      previous: resultV1.snapshot,
    });

    const v2Record = resultV2.snapshot.records.find((record) => record.version === 'v2');
    expect(v2Record?.embeddingCount).toBe(0);
    expect(v2Record?.status).toBe('pending');
  });

  it('prevents duplicate embedding persistence across retries', () => {
    const first = persistKnowledgeArtifacts([document('v1', 'digest-v1')], [embedding('v1', 'emb-v1')]);
    const retry = persistKnowledgeArtifacts([document('v1', 'digest-v1')], [embedding('v1', 'emb-v1')], {
      previous: first.snapshot,
    });

    expect(retry.duplicateEmbeddingCount).toBe(1);
    expect(retry.snapshot.embeddings.filter((entry) => entry.embeddingId === 'emb-v1')).toHaveLength(1);
  });

  it('supports recovery from partial failure before availability mark', () => {
    const partial = persistKnowledgeArtifacts([document('v1', 'digest-v1')], [embedding('v1', 'emb-v1')], {
      failBeforeMarkAvailable: true,
    });
    expect(partial.partialFailure).toBe(true);
    expect(partial.pendingVersionIds.length).toBeGreaterThan(0);

    const recovered = recoverPendingVersions(partial.snapshot);
    const availableCount = recovered.records.filter((record) => record.status === 'available').length;
    expect(availableCount).toBeGreaterThan(0);
  });

  it('keeps replay output stable for same input and snapshot state', () => {
    const base = persistKnowledgeArtifacts([document('v1', 'digest-v1')], [embedding('v1', 'emb-v1')], {
      previous: createEmptySnapshot(),
    });
    const replayA = persistKnowledgeArtifacts([document('v1', 'digest-v1')], [embedding('v1', 'emb-v1')], {
      previous: base.snapshot,
    });
    const replayB = persistKnowledgeArtifacts([document('v1', 'digest-v1')], [embedding('v1', 'emb-v1')], {
      previous: base.snapshot,
    });

    expect(replayA.snapshot.records).toEqual(replayB.snapshot.records);
    expect(replayA.snapshot.embeddings).toEqual(replayB.snapshot.embeddings);
  });

  it('updates index events only after versions are available', () => {
    const partial = persistKnowledgeArtifacts([document('v1', 'digest-v1')], [embedding('v1', 'emb-v1')], {
      failBeforeMarkAvailable: true,
    });
    expect(partial.snapshot.indexEvents).toHaveLength(0);

    const recovered = recoverPendingVersions(partial.snapshot);
    const indexed = applyIndexUpdateBoundary(recovered);
    expect(indexed.indexEvents.length).toBeGreaterThan(0);
    expect(indexed.indexEvents.every((event) => event.status === 'completed')).toBe(true);
  });
});
