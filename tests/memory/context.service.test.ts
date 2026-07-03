import { describe, it, expect, beforeEach } from 'vitest';
import { ContextService } from '../../src/memory/context.service.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createTestMemoryRepository } from '../helpers/sql-test-harness.js';

describe('ContextService', () => {
  let service: ContextService;
  let repository: MemoryRepository;
  const ownerId = 'owner-context';

  beforeEach(() => {
    const mockDb = new MockD1Client();
    repository = createTestMemoryRepository(mockDb);
    service = new ContextService(repository);
  });

  async function seed(title: string, content: string): Promise<void> {
    await repository.insert({
      title,
      project: 'mangroveapps',
      content,
      summary: `${title} summary`,
      tags: ['hydration'],
      keywords: ['hydration'],
      category: '',
      memoryType: 'note',
      importance: 80,
      language: 'id',
      notes: '',
      codename: `NOTE-${Math.random().toString(16).slice(2, 6)}`,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      favorite: false,
      ownerId,
    });
  }

  it('should build context and record access', async () => {
    await seed('Hydration handoff', 'Fix hydration bug in chat component');

    const result = await service.buildContext(
      { ownerId },
      { query: 'hydration', projectId: 'mangroveapps', limit: 5 },
    );

    expect(result.context).toContain('Hydration handoff');
    expect(result.memories.length).toBeGreaterThan(0);

    const updated = await repository.findById(result.memories[0].id, ownerId);
    expect(updated?.accessCount).toBe(1);
    expect(updated?.lastAccessed).toBeTruthy();
  });

  it('should build full prompt', async () => {
    await seed('Architecture note', 'Document engine overview');

    const result = await service.buildPrompt(
      { ownerId },
      { task: 'Summarize architecture', query: 'architecture', limit: 3 },
    );

    expect(result.system).toBeTruthy();
    expect(result.user).toContain('Summarize architecture');
    expect(result.context).toContain('Architecture note');
  });
});
