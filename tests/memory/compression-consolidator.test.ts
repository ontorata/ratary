import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryConsolidator } from '../../src/memory/consolidator.js';
import { RuleBasedCompressionPolicy } from '../../src/memory/compression/rule-based-compression-policy.js';
import type { ICompressionSummarizer } from '../../src/memory/compression/compression-summarizer.interface.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import {
  createTestMemoryRepository,
  createTestRelationRepository,
} from '../helpers/sql-test-harness.js';
import { computeSemanticHash } from '../../src/memory/semantic-hash.js';

describe('MemoryConsolidator with semantic compression (Phase 5.5)', () => {
  const ownerId = 'owner-compression';
  let repository: ReturnType<typeof createTestMemoryRepository>;
  let relationRepository: ReturnType<typeof createTestRelationRepository>;
  let consolidator: MemoryConsolidator;

  beforeEach(() => {
    const mockDb = new MockD1Client();
    repository = createTestMemoryRepository(mockDb);
    relationRepository = createTestRelationRepository(mockDb);
    consolidator = new MemoryConsolidator(repository, relationRepository, {
      compressionPolicy: new RuleBasedCompressionPolicy(),
      compressionEnabled: true,
    });
  });

  async function seedDuplicate(title: string, content: string, importance = 50): Promise<void> {
    const hash = computeSemanticHash(title, `${title} summary`, content);
    await repository.insert({
      title,
      project: 'ai-brain',
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
      level: 'note',
    });
  }

  it('creates summary memory and consolidates relations when compression enabled', async () => {
    await seedDuplicate('Compression topic', 'identical body for compression');
    await seedDuplicate('Compression topic', 'identical body for compression', 40);

    const report = await consolidator.run({ ownerId }, { dryRun: false, generateSummary: true });

    expect(report.summariesCreated).toBeGreaterThan(0);
    expect(report.relationsCreated).toBeGreaterThan(0);
    expect(report.duplicatesArchived).toBeGreaterThan(0);

    const all = await repository.findAllByOwner(ownerId);
    const summary = all.find((m) => m.level === 'summary' || m.level === 'canonical');
    expect(summary).toBeDefined();
    expect(summary?.title).toMatch(/^Summary:/);
  });

  it('does not mutate when dry-run even with compression enabled', async () => {
    await seedDuplicate('Dry run topic', 'same content');
    await seedDuplicate('Dry run topic', 'same content');

    const report = await consolidator.run({ ownerId }, { generateSummary: true });

    expect(report.dryRun).toBe(true);
    expect(report.summariesCreated).toBe(0);
    expect(report.duplicatesArchived).toBe(0);
  });

  it('uses injected summarizer for consolidated summary memory', async () => {
    const mockSummarizer: ICompressionSummarizer = {
      algorithmId: 'mock_v1',
      summarize: async () => 'MOCK_SUMMARY',
    };

    consolidator = new MemoryConsolidator(repository, relationRepository, {
      compressionPolicy: new RuleBasedCompressionPolicy(),
      compressionEnabled: true,
      summarizer: mockSummarizer,
    });

    await seedDuplicate('Mock summary topic', 'identical body');
    await seedDuplicate('Mock summary topic', 'identical body', 40);

    const report = await consolidator.run({ ownerId }, { dryRun: false, generateSummary: true });

    expect(report.summariesCreated).toBeGreaterThan(0);
    const all = await repository.findAllByOwner(ownerId);
    const summary = all.find((m) => m.title.startsWith('Summary:'));
    expect(summary?.summary).toBe('MOCK_SUMMARY');
  });
});
