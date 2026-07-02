import { describe, it, expect, beforeEach } from 'vitest';
import { Retriever } from '../../src/memory/retriever.js';
import { SqlRetrievalCandidateSource } from '../../src/memory/sql-retrieval-candidate-source.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('Retriever', () => {
  let retriever: Retriever;
  let repository: MemoryRepository;
  const ownerId = 'owner-retriever';

  beforeEach(() => {
    const mockDb = new MockD1Client();
    repository = new MemoryRepository(mockDb);
    retriever = new Retriever(new SqlRetrievalCandidateSource(repository));
  });

  async function seed(
    title: string,
    project: string,
    importance = 50,
    memoryOwnerId = ownerId,
  ): Promise<void> {
    await repository.insert({
      title,
      project,
      content: `${title} body`,
      summary: '',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance,
      language: 'id',
      notes: '',
      codename: `NOTE-${Math.random().toString(16).slice(2, 6)}`,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      favorite: false,
      ownerId: memoryOwnerId,
    });
  }

  it('should cap candidate fetch and scope by owner', async () => {
    for (let i = 0; i < 5; i++) {
      await seed(`Memory ${i}`, 'ai-brain');
    }
    await seed('Other owner', 'ai-brain', 99, 'other-owner');

    const results = await retriever.retrieve({
      scope: { ownerId },
      projectId: 'ai-brain',
      limit: 3,
    });

    expect(results.length).toBeLessThanOrEqual(9);
    expect(results.every((m) => m.ownerId === ownerId)).toBe(true);
  });

  it('should filter by query keyword', async () => {
    await seed('Hydration fix', 'mangroveapps');
    await seed('Unrelated topic', 'mangroveapps');

    const results = await retriever.retrieve({
      scope: { ownerId },
      query: 'Hydration',
      limit: 10,
    });

    expect(results.some((m) => m.title.includes('Hydration'))).toBe(true);
  });

  it('should omit full content bodies in retrieval projection', async () => {
    await seed('Heavy body', 'mangroveapps');
    const memory = (await repository.findAllByOwner(ownerId))[0];
    expect(memory.content.length).toBeGreaterThan(0);

    const results = await retriever.retrieve({
      scope: { ownerId },
      projectId: 'mangroveapps',
      limit: 5,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toBe('');
    expect(results[0].title).toBe('Heavy body');
  });
});
