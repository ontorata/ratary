import { describe, expect, it } from 'vitest';
import {
  KnowledgeCandidateProvider,
  type KnowledgeRecallRecord,
} from '../../src/memory/recall/knowledge-candidate-provider.js';

const records: KnowledgeRecallRecord[] = [
  {
    versionId: 'kv-1',
    documentId: 'doc-1',
    organizationId: 'org-ontorata',
    version: 'v1',
    status: 'available',
    embeddingCount: 2,
    createdAt: '2026-07-08T06:00:00.000Z',
    updatedAt: '2026-07-08T06:00:01.000Z',
    sourceRef: '.ai/core/architecture/ADR-0005-knowledge-ingestion-pipeline.md',
    sourceType: 'adr',
    title: 'ADR-0005',
  },
  {
    versionId: 'kv-foreign',
    documentId: 'doc-foreign',
    organizationId: 'org-foreign',
    version: 'v1',
    status: 'available',
    embeddingCount: 1,
    createdAt: '2026-07-08T06:00:00.000Z',
    updatedAt: '2026-07-08T06:00:01.000Z',
  },
];

describe('KnowledgeCandidateProvider', () => {
  it('returns raw knowledge candidates with standard metadata', async () => {
    const provider = new KnowledgeCandidateProvider(() => records);
    const candidateSet = await provider.provideCandidates({
      requestId: 'req-1',
      organizationId: 'org-ontorata',
      query: 'knowledge foundation',
      traceContext: { sessionId: 'sess-1' },
    });

    expect(candidateSet.providerName).toBe('knowledge');
    expect(candidateSet.candidates).toHaveLength(1);
    expect(candidateSet.candidates[0]?.metadata.source).toBe('knowledge');
    expect(candidateSet.candidates[0]?.metadata.embeddingVersion).toBe('v1');
    expect(candidateSet.candidates[0]?.signals).toEqual({});
  });

  it('does not return pending or foreign organization records', async () => {
    const provider = new KnowledgeCandidateProvider(() => [
      ...records,
      {
        versionId: 'kv-pending',
        documentId: 'doc-pending',
        organizationId: 'org-ontorata',
        version: 'v2',
        status: 'pending',
        embeddingCount: 0,
        createdAt: '2026-07-08T06:00:00.000Z',
        updatedAt: '2026-07-08T06:00:01.000Z',
      },
    ]);

    const candidateSet = await provider.provideCandidates({
      requestId: 'req-2',
      organizationId: 'org-ontorata',
      query: 'pending',
      traceContext: { correlationId: 'corr-2' },
    });

    expect(candidateSet.candidates).toHaveLength(1);
    expect(candidateSet.candidates[0]?.versionId).toBe('kv-1');
  });
});
