import { describe, it, expect, beforeEach } from 'vitest';
import { SummaryEnrichmentRunner } from '../../src/jobs/summary-enrichment-runner.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createTestMemoryRepository } from '../helpers/sql-test-harness.js';
import type { ICompressionSummarizer } from '../../src/memory/compression/compression-summarizer.interface.js';

class MockSummarizer implements ICompressionSummarizer {
  readonly algorithmId = 'mock_v1';

  async summarize(content: string, _ctx: { title: string; project?: string }): Promise<string> {
    return `LLM: ${content.slice(0, 40)}`;
  }
}

describe('SummaryEnrichmentRunner', () => {
  const ownerId = 'owner-enrich';
  let repository: ReturnType<typeof createTestMemoryRepository>;
  let runner: SummaryEnrichmentRunner;

  beforeEach(() => {
    const mockDb = new MockD1Client();
    repository = createTestMemoryRepository(mockDb);
    runner = new SummaryEnrichmentRunner(repository, new MockSummarizer());
  });

  it('reports candidates in dry-run without persisting', async () => {
    await repository.insert({
      title: 'Note A',
      project: 'ai-brain',
      content: 'Original long content that differs from summary.',
      summary: 'old rule summary',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      codename: 'NOTE-aaaa',
      slug: 'note-a',
      favorite: false,
      ownerId,
    });

    const report = await runner.run({ ownerId }, { dryRun: true });

    expect(report.scanned).toBe(1);
    expect(report.enriched).toBe(1);
    expect(report.algorithmId).toBe('mock_v1');

    const stored = (await repository.findAllByOwner(ownerId))[0];
    expect(stored.summary).toBe('old rule summary');
  });

  it('updates summaries when execute mode', async () => {
    await repository.insert({
      title: 'Note B',
      project: 'ai-brain',
      content: 'Body to refresh with async summarizer.',
      summary: 'stale',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      codename: 'NOTE-bbbb',
      slug: 'note-b',
      favorite: false,
      ownerId,
    });

    const report = await runner.run({ ownerId }, { dryRun: false });

    expect(report.enriched).toBe(1);
    const stored = (await repository.findAllByOwner(ownerId))[0];
    expect(stored.summary).toMatch(/^LLM:/);
  });
});
