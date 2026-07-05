import { describe, it, expect } from 'vitest';
import { LexicalCrossEncoderReranker } from '../../src/search/rerank/onnx-cross-encoder-reranker.js';
import type { PrecisionSearchHit } from '../../src/types/precision-search.js';

const hit = (id: string, title: string, score: number): PrecisionSearchHit => ({
  id,
  codename: null,
  slug: null,
  title,
  project: 'ratary',
  content: title,
  summary: title,
  keywords: [],
  category: '',
  memoryType: 'note',
  importance: 50,
  language: 'id',
  notes: '',
  tags: [],
  favorite: false,
  archived: false,
  ownerId: 'owner',
  projectId: 'ratary',
  level: 'note',
  lastAccessed: null,
  accessCount: 0,
  embeddingId: null,
  objectKey: null,
  semanticHash: null,
  aliases: [],
  sourcePath: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  relevanceScore: score,
});

describe('LexicalCrossEncoderReranker', () => {
  it('reorders candidates by query overlap', async () => {
    const reranker = new LexicalCrossEncoderReranker();
    const reranked = await reranker.rerank(
      'architecture',
      [hit('1', 'Random note', 100), hit('2', 'System architecture', 50)],
      2,
    );
    expect(reranked[0].id).toBe('2');
  });
});
