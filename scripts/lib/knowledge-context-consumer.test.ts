import { describe, expect, it } from 'vitest';
import { resolveContextPackage } from './knowledge-context-consumer.js';
import { createEmptySnapshot, persistKnowledgeArtifacts } from './knowledge-store-boundary.js';
import type { EmbeddingRecord, KnowledgeDocument } from './knowledge-ingestion-contracts.js';

function doc(): KnowledgeDocument {
  return {
    documentId: 'doc-ontorata',
    organizationId: 'org-ontorata',
    sourceType: 'governance',
    sourceRef: '.ai/core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md',
    title: 'Implementation Completion Protocol',
    content: 'Implementation is incomplete until documentation is synchronized.',
    contentDigest: 'digest-ontorata',
    version: 'v1',
    ingestedAt: '2026-07-08T06:00:00.000Z',
  };
}

function emb(): EmbeddingRecord {
  return {
    embeddingId: 'emb-ontorata-v1',
    chunkId: 'chunk-1',
    documentId: 'doc-ontorata',
    organizationId: 'org-ontorata',
    version: 'v1',
    model: 'deterministic-local-v1',
    vectorDigest: 'vec-12345',
    createdAt: '2026-07-08T06:00:01.000Z',
  };
}

describe('knowledge context consumer boundary', () => {
  it('returns context package for matching organization', () => {
    const persisted = persistKnowledgeArtifacts([doc()], [emb()], { previous: createEmptySnapshot() });
    const context = resolveContextPackage(persisted.snapshot, {
      identityId: 'identity-founder',
      organizationId: 'org-ontorata',
    });

    expect(context.recordCount).toBeGreaterThan(0);
    expect(context.embeddingCount).toBeGreaterThan(0);
  });

  it('blocks context package for foreign organization', () => {
    const persisted = persistKnowledgeArtifacts([doc()], [emb()], { previous: createEmptySnapshot() });
    const context = resolveContextPackage(persisted.snapshot, {
      identityId: 'identity-foreign',
      organizationId: 'org-foreign',
    });

    expect(context.recordCount).toBe(0);
    expect(context.embeddingCount).toBe(0);
  });
});
