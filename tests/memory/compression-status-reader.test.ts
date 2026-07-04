import { describe, it, expect, beforeEach } from 'vitest';
import { CompressionStatusReader } from '../../src/memory/compression/compression-status-reader.js';
import { RuleBasedCompressionPolicy } from '../../src/memory/compression/rule-based-compression-policy.js';
import { MemoryConsolidator } from '../../src/memory/consolidator.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import {
  asSqlDatabase,
  createTestMemoryRepository,
  createTestRelationRepository,
} from '../helpers/sql-test-harness.js';
import { computeSemanticHash } from '../../src/memory/semantic-hash.js';

describe('CompressionStatusReader', () => {
  const ownerId = 'owner-compression-status';
  let mockDb: MockD1Client;
  let repository: ReturnType<typeof createTestMemoryRepository>;
  let relationRepository: ReturnType<typeof createTestRelationRepository>;
  let reader: CompressionStatusReader;

  beforeEach(() => {
    mockDb = new MockD1Client();
    repository = createTestMemoryRepository(mockDb);
    relationRepository = createTestRelationRepository(mockDb);
    reader = new CompressionStatusReader(
      asSqlDatabase(mockDb),
      repository,
      relationRepository,
      {
        COMPRESSION_ENABLED: false,
        COMPRESSION_POLICY: 'rule',
        COMPRESSION_SCHEDULER: 'none',
      },
      new RuleBasedCompressionPolicy(),
    );
  });

  async function seedDuplicate(title: string, content: string): Promise<void> {
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
      importance: 50,
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

  it('returns baseline counts when compression is disabled', async () => {
    await seedDuplicate('Topic A', 'same body');
    await seedDuplicate('Topic A', 'same body');

    const status = await reader.getStatus({ ownerId });

    expect(status.compressionEnabled).toBe(false);
    expect(status.compressionPolicy).toBe('rule');
    expect(status.counts.activeNotesAndRaw).toBe(2);
    expect(status.counts.withCompressionMeta).toBe(0);
    expect(status.pending.duplicateMemories).toBe(2);
    expect(status.pending.compressibleClusters).toBe(0);
    expect(status.lastCompressedAt).toBeNull();
  });

  it('reports compression metadata and pending clusters when enabled', async () => {
    const enabledReader = new CompressionStatusReader(
      asSqlDatabase(mockDb),
      repository,
      relationRepository,
      {
        COMPRESSION_ENABLED: true,
        COMPRESSION_POLICY: 'rule',
        COMPRESSION_SCHEDULER: 'none',
      },
      new RuleBasedCompressionPolicy(),
    );

    await seedDuplicate('Topic B', 'duplicate body for status');
    await seedDuplicate('Topic B', 'duplicate body for status');

    const consolidator = new MemoryConsolidator(repository, relationRepository, {
      compressionPolicy: new RuleBasedCompressionPolicy(),
      compressionEnabled: true,
    });
    await consolidator.run({ ownerId }, { dryRun: false, generateSummary: true });

    const status = await enabledReader.getStatus({ ownerId });

    expect(status.compressionEnabled).toBe(true);
    expect(status.counts.summaryMemories).toBeGreaterThan(0);
    expect(status.counts.withCompressionMeta).toBeGreaterThan(0);
    expect(status.lastCompressedAt).not.toBeNull();
    expect(status.pending.duplicateMemories).toBe(0);
  });

  it('filters by projectId', async () => {
    await repository.insert({
      title: 'Other project',
      project: 'other',
      content: 'x',
      summary: 'x',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      codename: 'NOTE-0001',
      slug: 'other-project',
      favorite: false,
      ownerId,
      level: 'note',
    });

    const status = await reader.getStatus({ ownerId }, { projectId: 'ai-brain' });

    expect(status.projectId).toBe('ai-brain');
    expect(status.counts.activeNotesAndRaw).toBe(0);
  });
});
