import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryConsolidator } from '../../src/memory/consolidator.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MemoryRelationRepository } from '../../src/repositories/memory-relation.repository.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { computeSemanticHash } from '../../src/memory/semantic-hash.js';

describe('MemoryConsolidator', () => {
  let consolidator: MemoryConsolidator;
  let repository: MemoryRepository;
  const ownerId = 'owner-consolidator';

  beforeEach(() => {
    const mockDb = new MockD1Client();
    repository = new MemoryRepository(mockDb);
    consolidator = new MemoryConsolidator(repository, new MemoryRelationRepository(mockDb));
  });

  async function seedDuplicate(title: string, content: string, importance = 50): Promise<void> {
    const hash = computeSemanticHash(title, `${title} summary`, content);
    await repository.insert({
      title,
      project: 'mangroveapps',
      content,
      summary: `${title} summary`,
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance,
      language: 'id',
      notes: '',
      codename: `NOTE-${Math.random().toString(16).slice(2, 6)}`,
      slug: `${title}-${Math.random().toString(16).slice(2, 4)}`,
      favorite: false,
      ownerId,
      semanticHash: hash,
    });
  }

  it('should report duplicates in dry-run mode by default', async () => {
    await seedDuplicate('Hydration fix', 'Same content body');
    await seedDuplicate('Hydration fix', 'Same content body', 40);

    const report = await consolidator.run({ ownerId });

    expect(report.dryRun).toBe(true);
    expect(report.duplicatesFound).toBeGreaterThanOrEqual(2);
    expect(report.duplicatesArchived).toBe(0);
    expect(report.actions.some((a) => a.type === 'archive_duplicate')).toBe(true);
  });

  it('should archive duplicates when execute mode is enabled', async () => {
    await seedDuplicate('Duplicate note', 'Shared body', 80);
    await seedDuplicate('Duplicate note', 'Shared body', 60);

    const report = await consolidator.run({ ownerId }, { dryRun: false });

    expect(report.duplicatesArchived).toBeGreaterThanOrEqual(1);
    const all = await repository.findAllByOwner(ownerId);
    const archived = all.filter((m) => m.archived);
    expect(archived.length).toBeGreaterThanOrEqual(1);
  });

  it('should promote stale high-access memories', async () => {
    const staleDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    await repository.insert({
      title: 'Stale popular note',
      project: 'ai-brain',
      content: 'Old but useful',
      summary: 'summary',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      codename: 'NOTE-stale',
      slug: 'stale-popular-note',
      favorite: false,
      ownerId,
      createdAt: staleDate,
      updatedAt: staleDate,
      accessCount: 5,
    });

    const memory = (await repository.findAllByOwner(ownerId))[0];

    const report = await consolidator.run({ ownerId }, { dryRun: false, staleDays: 30 });

    expect(report.stalePromoted).toBeGreaterThanOrEqual(1);
    const updated = await repository.findById(memory.id, ownerId);
    expect(updated?.importance).toBeGreaterThan(50);
  });
});
