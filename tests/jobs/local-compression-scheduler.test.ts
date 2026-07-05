import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LocalCompressionScheduler } from '../../src/jobs/local-compression-scheduler.js';
import { CompressionJobRunner } from '../../src/jobs/compression-job-runner.js';
import { RuleBasedCompressionPolicy } from '../../src/memory/compression/rule-based-compression-policy.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import {
  createTestMemoryRepository,
  createTestRelationRepository,
} from '../helpers/sql-test-harness.js';

describe('LocalCompressionScheduler (D55-01)', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('enqueue defers work until runPending drains the queue', async () => {
    const mockDb = new MockD1Client();
    const repository = createTestMemoryRepository(mockDb);
    const runner = new CompressionJobRunner(
      repository,
      createTestRelationRepository(mockDb),
      new RuleBasedCompressionPolicy(),
      false,
    );
    const scheduler = new LocalCompressionScheduler(runner);

    const jobId = await scheduler.enqueue({ ownerId: 'owner-1' }, { dryRun: true });
    expect(jobId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(scheduler.pendingCount()).toBe(1);

    const report = await scheduler.runPending(10);
    expect(report.candidates).toBe(0);
    expect(scheduler.pendingCount()).toBe(0);
  });
});
