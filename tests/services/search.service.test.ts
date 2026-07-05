import { describe, it, expect, beforeEach } from 'vitest';
import { SearchService } from '../../src/search/search.service.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createTestMemoryRepository } from '../helpers/sql-test-harness.js';

describe('SearchService', () => {
  let service: SearchService;
  let repository: MemoryRepository;
  const ownerId = 'search-owner';

  beforeEach(() => {
    const mockDb = new MockD1Client();
    repository = createTestMemoryRepository(mockDb);
    service = new SearchService(repository);
  });

  async function seed(title: string, content: string) {
    await repository.insert({
      title,
      project: 'p',
      content,
      summary: '',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      codename: `NOTE-${Math.random().toString(36).slice(2, 6)}`,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      favorite: false,
      ownerId,
    });
  }

  it('should return relevanceScore on search', async () => {
    await seed('JWT Auth', 'middleware');
    const result = await service.search(
      { ownerId },
      { q: 'JWT', limit: 10, offset: 0, archived: false },
    );
    expect(result.memories[0].relevanceScore).toBeGreaterThan(0);
  });

  it('should paginate after ranking', async () => {
    await seed('Alpha JWT', 'a');
    await seed('Beta JWT', 'b');
    const page = await service.search(
      { ownerId },
      { q: 'JWT', limit: 1, offset: 0, archived: false },
    );
    expect(page.memories).toHaveLength(1);
    expect(page.total).toBeGreaterThanOrEqual(2);
  });
});
