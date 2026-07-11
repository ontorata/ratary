import { describe, expect, it } from 'vitest';
import type { Memory } from '../../src/types/memory.js';
import type { IRetrievalCandidateSource } from '../../src/memory/retrieval-candidate-source.interface.js';
import { SqlCandidateProvider } from '../../src/memory/recall/sql-candidate-provider.js';

function memory(id: string, ownerId: string): Memory {
  return {
    id,
    ownerId,
    title: 'ADR recall',
    project: 'ontorata',
    content: 'knowledge ingestion pipeline',
    summary: '',
    tags: [],
    keywords: [],
    favorite: false,
    archived: false,
    importance: 10,
    accessCount: 0,
    level: 'note',
    codename: null,
    slug: null,
    category: '',
    memoryType: 'note',
    language: 'en',
    notes: '',
    projectId: '',
    lastAccessed: null,
    embeddingId: 'emb-1',
    objectKey: null,
    semanticHash: null,
    aliases: [],
    sourcePath: '.ai/core/architecture/ADR-0005-knowledge-ingestion-pipeline.md',
    createdAt: '2026-07-08T06:00:00.000Z',
    updatedAt: '2026-07-08T06:00:01.000Z',
  };
}

class StubSqlSource implements IRetrievalCandidateSource {
  constructor(private readonly rows: Memory[]) {}

  findCandidates(): Promise<Memory[]> {
    return Promise.resolve(this.rows);
  }
}

describe('SqlCandidateProvider', () => {
  it('returns raw candidates with standard metadata and empty signals', async () => {
    const provider = new SqlCandidateProvider(
      new StubSqlSource([memory('mem-1', 'org-ontorata')]),
    );
    const candidateSet = await provider.provideCandidates({
      requestId: 'req-1',
      organizationId: 'org-ontorata',
      query: 'ingestion pipeline',
      traceContext: { sessionId: 'sess-1' },
    });

    expect(candidateSet.providerName).toBe('sql');
    expect(candidateSet.candidates).toHaveLength(1);
    expect(candidateSet.candidates[0]?.signals).toEqual({});
    expect(candidateSet.candidates[0]?.metadata.source).toBe('sql');
    expect(candidateSet.candidates[0]?.metadata.organizationId).toBe('org-ontorata');
  });

  it('filters foreign-owner rows without ranking', async () => {
    const provider = new SqlCandidateProvider(
      new StubSqlSource([memory('mem-1', 'org-foreign'), memory('mem-2', 'org-ontorata')]),
    );
    const candidateSet = await provider.provideCandidates({
      requestId: 'req-2',
      organizationId: 'org-ontorata',
      query: 'baseline',
      traceContext: { correlationId: 'corr-2' },
    });

    expect(candidateSet.candidates).toHaveLength(1);
    expect(candidateSet.candidates[0]?.memoryId).toBe('mem-2');
  });
});
