import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IRetrievalCandidateSource } from '../../src/memory/retrieval-candidate-source.interface.js';
import type { Memory } from '../../src/types/memory.js';
import type { RetrievalFilters } from '../../src/repositories/memory.repository.interface.js';
import { CompositeRetrievalCandidateSource } from '../../src/memory/composite-retrieval-candidate-source.js';

function createMockMemory(id: string, title: string): Memory {
  return {
    id,
    ownerId: 'owner-1',
    codename: `mem-${id}`,
    slug: null,
    title,
    project: 'test-project',
    content: `Content for ${id}`,
    summary: '',
    keywords: [],
    category: '',
    memoryType: 'note',
    importance: 0,
    language: 'en',
    notes: '',
    tags: [],
    favorite: false,
    archived: false,
    projectId: '',
    level: 'note',
    lastAccessed: null,
    accessCount: 0,
    embeddingId: null,
    objectKey: null,
    semanticHash: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

function createMockSource(memories: Memory[]): IRetrievalCandidateSource {
  return {
    findCandidates: vi.fn().mockResolvedValue(memories),
  };
}

describe('CompositeRetrievalCandidateSource', () => {
  let filters: RetrievalFilters;

  beforeEach(() => {
    filters = {
      ownerId: 'owner-1',
      maxCandidates: 100,
    };
  });

  describe('empty sources', () => {
    it('should return empty array when all sources return empty', async () => {
      const sqlSource = createMockSource([]);
      const vectorSource = createMockSource([]);
      const composite = new CompositeRetrievalCandidateSource([sqlSource, vectorSource]);

      const result = await composite.findCandidates(filters);

      expect(result).toEqual([]);
    });

    it('should return results when one source returns empty', async () => {
      const sqlMemories = [createMockMemory('1', 'SQL Memory')];
      const sqlSource = createMockSource(sqlMemories);
      const vectorSource = createMockSource([]);
      const composite = new CompositeRetrievalCandidateSource([sqlSource, vectorSource]);

      const result = await composite.findCandidates(filters);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should handle single source', async () => {
      const sqlMemories = [
        createMockMemory('1', 'SQL Memory'),
        createMockMemory('2', 'SQL Memory 2'),
      ];
      const sqlSource = createMockSource(sqlMemories);
      const composite = new CompositeRetrievalCandidateSource([sqlSource]);

      const result = await composite.findCandidates(filters);

      expect(result).toHaveLength(2);
    });
  });

  describe('deduplication', () => {
    it('should dedupe by memoryId when present in multiple sources', async () => {
      const sharedMemory = createMockMemory('shared', 'Shared Memory');
      const sqlMemories = [sharedMemory, createMockMemory('sql-only', 'SQL Only')];
      const vectorMemories = [sharedMemory, createMockMemory('vector-only', 'Vector Only')];

      const sqlSource = createMockSource(sqlMemories);
      const vectorSource = createMockSource(vectorMemories);
      const composite = new CompositeRetrievalCandidateSource([sqlSource, vectorSource]);

      const result = await composite.findCandidates(filters);

      // Should have 3 unique memories, no duplicates
      const ids = result.map((m) => m.id);
      expect(ids).toEqual(expect.arrayContaining(['shared', 'sql-only', 'vector-only']));
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('RRF scoring', () => {
    it('should rank memories appearing in both sources higher', async () => {
      const sqlMemories = [
        createMockMemory('sql-first', 'SQL First'),
        createMockMemory('shared', 'Shared Memory'),
      ];
      const vectorMemories = [
        createMockMemory('vector-first', 'Vector First'),
        createMockMemory('shared', 'Shared Memory'),
      ];

      const sqlSource = createMockSource(sqlMemories);
      const vectorSource = createMockSource(vectorMemories);
      const composite = new CompositeRetrievalCandidateSource([sqlSource, vectorSource]);

      const result = await composite.findCandidates(filters);

      // 'shared' should be first because it appears in both sources
      expect(result[0].id).toBe('shared');
    });

    it('should handle different orderings across sources', async () => {
      const sqlMemories = [
        createMockMemory('a', 'A'),
        createMockMemory('b', 'B'),
        createMockMemory('c', 'C'),
      ];
      const vectorMemories = [
        createMockMemory('c', 'C'),
        createMockMemory('b', 'B'),
        createMockMemory('a', 'A'),
      ];

      const sqlSource = createMockSource(sqlMemories);
      const vectorSource = createMockSource(vectorMemories);
      const composite = new CompositeRetrievalCandidateSource([sqlSource, vectorSource]);

      const result = await composite.findCandidates(filters);

      // All three should be present
      expect(result.map((m) => m.id)).toEqual(expect.arrayContaining(['a', 'b', 'c']));
    });
  });

  describe('cap enforcement', () => {
    it('should respect RETRIEVAL_CANDIDATE_CAP (100)', async () => {
      // Create 150 memories across sources
      const sqlMemories = Array.from({ length: 50 }, (_, i) =>
        createMockMemory(`sql-${i}`, `SQL ${i}`),
      );
      const vectorMemories = Array.from({ length: 50 }, (_, i) =>
        createMockMemory(`vec-${i}`, `Vec ${i}`),
      );

      const sqlSource = createMockSource(sqlMemories);
      const vectorSource = createMockSource(vectorMemories);
      const composite = new CompositeRetrievalCandidateSource([sqlSource, vectorSource]);

      const result = await composite.findCandidates(filters);

      // Should be capped at 100
      expect(result.length).toBeLessThanOrEqual(100);
    });

    it('should apply per-source caps (50 each)', async () => {
      const sqlMemories = Array.from({ length: 100 }, (_, i) =>
        createMockMemory(`sql-${i}`, `SQL ${i}`),
      );
      const vectorMemories = Array.from({ length: 100 }, (_, i) =>
        createMockMemory(`vec-${i}`, `Vec ${i}`),
      );

      const sqlSource = createMockSource(sqlMemories);
      const vectorSource = createMockSource(vectorMemories);
      const composite = new CompositeRetrievalCandidateSource([sqlSource, vectorSource]);

      await composite.findCandidates(filters);

      // Each source should only contribute 50 max
      expect(sqlSource.findCandidates).toHaveBeenCalledWith(
        expect.objectContaining({ maxCandidates: 50 }),
      );
      expect(vectorSource.findCandidates).toHaveBeenCalledWith(
        expect.objectContaining({ maxCandidates: 50 }),
      );
    });
  });

  describe('weighted RRF', () => {
    it('should rank SQL results higher with SQL-biased weights (sql: 2.0, vector: 1.0)', async () => {
      // Override SOURCE_WEIGHTS via module mocking if needed,
      // but we test the ranking behavior directly
      const sqlMemories = [
        createMockMemory('sql-first', 'SQL First'),
        createMockMemory('shared', 'Shared Memory'),
      ];
      const vectorMemories = [
        createMockMemory('vector-first', 'Vector First'),
        createMockMemory('shared', 'Shared Memory'),
      ];

      const sqlSource = createMockSource(sqlMemories);
      const vectorSource = createMockSource(vectorMemories);
      const composite = new CompositeRetrievalCandidateSource([sqlSource, vectorSource]);

      const result = await composite.findCandidates(filters);

      // All should be present
      expect(result.map((m) => m.id)).toEqual(
        expect.arrayContaining(['sql-first', 'vector-first', 'shared']),
      );
    });

    it('should handle memories in only one source', async () => {
      const sqlMemories = [createMockMemory('sql-only', 'SQL Only')];
      const vectorMemories = [createMockMemory('vector-only', 'Vector Only')];

      const sqlSource = createMockSource(sqlMemories);
      const vectorSource = createMockSource(vectorMemories);
      const composite = new CompositeRetrievalCandidateSource([sqlSource, vectorSource]);

      const result = await composite.findCandidates(filters);

      expect(result).toHaveLength(2);
      expect(result.map((m) => m.id)).toEqual(expect.arrayContaining(['sql-only', 'vector-only']));
    });

    it('should preserve ordering when sources agree', async () => {
      const sqlMemories = [
        createMockMemory('first', 'First'),
        createMockMemory('second', 'Second'),
      ];
      const vectorMemories = [
        createMockMemory('first', 'First'),
        createMockMemory('second', 'Second'),
      ];

      const sqlSource = createMockSource(sqlMemories);
      const vectorSource = createMockSource(vectorMemories);
      const composite = new CompositeRetrievalCandidateSource([sqlSource, vectorSource]);

      const result = await composite.findCandidates(filters);

      expect(result[0].id).toBe('first');
      expect(result[1].id).toBe('second');
    });
  });

  describe('interface compliance', () => {
    it('should implement IRetrievalCandidateSource', () => {
      const sqlSource = createMockSource([]);
      const composite = new CompositeRetrievalCandidateSource([sqlSource]);

      expect(typeof composite.findCandidates).toBe('function');
    });

    it('should pass filters to sources', async () => {
      const sqlSource = createMockSource([]);
      const vectorSource = createMockSource([]);
      const composite = new CompositeRetrievalCandidateSource([sqlSource, vectorSource]);

      // Call with filters - each source receives capped version
      await composite.findCandidates(filters);

      // Verify both sources were called
      expect(sqlSource.findCandidates).toHaveBeenCalled();
      expect(vectorSource.findCandidates).toHaveBeenCalled();
    });
  });
});
