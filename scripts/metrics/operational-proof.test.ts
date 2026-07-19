import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appendDogfoodSession } from '../lib/operational-usage-log.js';
import {
  collectOperationalMetrics,
  writeOperationalMetrics,
} from './operational-proof.js';

describe('operational-proof metrics', () => {
  let tempRoot: string;

  beforeEach(async () => {
    tempRoot = await mkdtemp(join(tmpdir(), 'ratary-p1e-metrics-'));
    vi.spyOn(process, 'cwd').mockReturnValue(tempRoot);
    const reviewsDir = join(tempRoot, '.ai/reviews/org-memory-dogfood');
    await mkdir(reviewsDir, { recursive: true });
    await writeFile(
      join(reviewsDir, 'ingestion-log.md'),
      [
        '# ingestion',
        '',
        '## run_id=00000000-0000-4000-8000-000000000001',
        '- ingested=10',
        '- failed=0',
        '- skipped=4',
        '- digest=abc123def4567890',
        '',
      ].join('\n'),
      'utf-8',
    );
    await writeFile(
      join(reviewsDir, 'recall-log.md'),
      [
        '# recall',
        '',
        '## run_id=00000000-0000-4000-8000-000000000002',
        '- pass_rate=100',
        '',
      ].join('\n'),
      'utf-8',
    );
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(tempRoot, { recursive: true, force: true });
  });

  it('aggregates ingestion, recall, and session counts', async () => {
    await appendDogfoodSession({
      tools: ['search_memory'],
      querySummary: 'fixture query',
    });

    const snapshot = await collectOperationalMetrics();
    expect(snapshot.ingestionFailed).toBe(0);
    expect(snapshot.ingestionSkipped).toBe(4);
    expect(snapshot.recallPassRate).toBe(100);
    expect(snapshot.sessionCount).toBe(1);
  });

  it('writes markdown and json snapshots', async () => {
    const snapshot = await writeOperationalMetrics();
    const json = await readFile(
      join(tempRoot, '.ai/reviews/org-memory-dogfood/operational-metrics.json'),
      'utf-8',
    );
    expect(JSON.parse(json).metricsRunId).toBe(snapshot.metricsRunId);
  });
});
