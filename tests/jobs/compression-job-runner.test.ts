import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CompressionJobRunner } from '../../src/jobs/compression-job-runner.js';
import { RuleBasedCompressionPolicy } from '../../src/memory/compression/rule-based-compression-policy.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import {
  createTestMemoryRepository,
  createTestRelationRepository,
  asSqlDatabase,
} from '../helpers/sql-test-harness.js';
import { createCompressionPorts } from '../../src/composition/create-compression-ports.js';
import { getEnv, resetEnvCache } from '../../src/config/index.js';
import { computeSemanticHash } from '../../src/memory/semantic-hash.js';

describe('CompressionJobRunner (Phase 5.5)', () => {
  const ownerId = 'owner-compress-job';

  beforeEach(() => {
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
    vi.stubEnv('D1_DATABASE_ID', 'test-database');
    vi.stubEnv('D1_API_TOKEN', 'test-token');
    vi.stubEnv('NODE_ENV', 'test');
    resetEnvCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('returns zero when compression disabled', async () => {
    const mockDb = new MockD1Client();
    const repository = createTestMemoryRepository(mockDb);
    const runner = new CompressionJobRunner(
      repository,
      createTestRelationRepository(mockDb),
      new RuleBasedCompressionPolicy(),
      false,
    );

    const report = await runner.run({ ownerId }, { dryRun: true });
    expect(report.candidates).toBe(0);
    expect(report.compressed).toBe(0);
  });

  it('reports candidates when enabled and duplicates exist', async () => {
    const mockDb = new MockD1Client();
    const repository = createTestMemoryRepository(mockDb);
    const hash = computeSemanticHash('Dup', 'summary', 'body');
    for (let i = 0; i < 2; i++) {
      await repository.insert({
        title: 'Dup',
        project: 'p',
        content: 'body',
        summary: 'summary',
        tags: [],
        keywords: [],
        category: '',
        memoryType: 'note',
        importance: 50,
        language: 'id',
        notes: '',
        codename: `NOTE-${i}`,
        slug: `dup-${i}`,
        favorite: false,
        ownerId,
        semanticHash: hash,
        level: 'note',
      });
    }

    const runner = new CompressionJobRunner(
      repository,
      createTestRelationRepository(mockDb),
      new RuleBasedCompressionPolicy(),
      true,
    );

    const report = await runner.run({ ownerId }, { dryRun: true });
    expect(report.candidates).toBeGreaterThanOrEqual(2);
    expect(report.compressed).toBe(0);
  });

  it('composition root reflects COMPRESSION_ENABLED flag', () => {
    const ports = createCompressionPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(false);
    expect(ports.runner).toBeDefined();
    expect(ports.policy).toBeDefined();
  });
});
