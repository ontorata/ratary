import { describe, it, expect, beforeEach } from 'vitest';
import { SqlRetrievalCandidateSource } from '../../src/memory/sql-retrieval-candidate-source.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('SqlRetrievalCandidateSource', () => {
  let source: SqlRetrievalCandidateSource;
  let repository: MemoryRepository;
  const ownerId = 'owner-sql-source';

  beforeEach(() => {
    const mockDb = new MockD1Client();
    repository = new MemoryRepository(mockDb);
    source = new SqlRetrievalCandidateSource(repository);
  });

  it('should delegate findCandidates to repository retrieval query', async () => {
    await repository.insert({
      title: 'Delegated retrieval',
      project: 'ai-brain',
      content: 'full body',
      summary: 'short',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      codename: 'NOTE-abcd',
      slug: 'delegated-retrieval',
      favorite: false,
      ownerId,
    });

    const results = await source.findCandidates({
      ownerId,
      projectId: 'ai-brain',
      archived: false,
      maxCandidates: 10,
    });

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Delegated retrieval');
    expect(results[0].content).toBe('');
  });
});
