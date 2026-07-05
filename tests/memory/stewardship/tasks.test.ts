import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setD1Client, resetD1Client } from '../../../src/db/index.js';
import { resetEnvCache, getEnv } from '../../../src/config/index.js';
import { MockD1Client } from '../../helpers/mock-d1.js';
import {
  createTestMemoryRepository,
  createTestRelationRepository,
  asSqlDatabase,
} from '../../helpers/sql-test-harness.js';
import { createMemoryService } from '../../../src/services/create-memory-service.js';
import { MemoryConsolidator } from '../../../src/memory/consolidator.js';
import { MemoryStewardshipOrchestrator } from '../../../src/memory/stewardship/memory-stewardship-orchestrator.js';
import { InMemoryStewardshipRunStore } from '../../../src/memory/stewardship/in-memory-stewardship-run-store.js';
import { MetadataAuditTask } from '../../../src/memory/stewardship/tasks/metadata-audit.task.js';
import { ConsolidationTask } from '../../../src/memory/stewardship/tasks/consolidation.task.js';
import { EmbeddingAuditTask } from '../../../src/memory/stewardship/tasks/embedding-audit.task.js';
import { RetrievalOptimizationTask } from '../../../src/memory/stewardship/tasks/retrieval-optimization.task.js';
import { GraphRepairTask } from '../../../src/memory/stewardship/tasks/graph-repair.task.js';
import { IndexRepairTask } from '../../../src/memory/stewardship/tasks/index-repair.task.js';
import { RankingRefreshTask } from '../../../src/memory/stewardship/tasks/ranking-refresh.task.js';
import { NoOpRelationInferenceOrchestrator } from '../../../src/inference/noop-relation-inference-orchestrator.js';
import { NoOpLearningOrchestrator } from '../../../src/learning/noop-learning-orchestrator.js';
import { SearchGraphOrchestrator } from '../../../src/search-graph-platform/services/search-graph-orchestrator.js';
import { NoOpSearchIndexSyncer, NoOpGraphIndexSyncer } from '../../../src/search-graph-platform/index.js';
import { NoOpSearchGraphSyncStore } from '../../../src/infrastructure/search-graph-platform/sql-search-graph-sync-store.js';
import { createMemoryStewardshipPorts } from '../../../src/composition/create-memory-stewardship-ports.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('NODE_ENV', 'test');

const scope = { ownerId: 'owner-steward' };

describe('stewardship tasks (Phase 04.7)', () => {
  let mockDb: MockD1Client;

  beforeEach(async () => {
    resetEnvCache();
    resetD1Client();
    mockDb = new MockD1Client();
    setD1Client(mockDb);

    const sql = asSqlDatabase(mockDb);
    const repository = createTestMemoryRepository(mockDb);
    const memoryService = createMemoryService(sql, repository);

    await memoryService.createMemory(scope, {
      title: 'Duplicate topic',
      content: 'identical body for dedup',
      project: 'stewardship',
      summary: '',
      tags: [],
      favorite: false,
      level: 'note',
    });
    await memoryService.createMemory(scope, {
      title: 'Duplicate topic',
      content: 'identical body for dedup',
      project: 'stewardship',
      summary: '',
      tags: [],
      favorite: false,
      level: 'note',
    });
    await memoryService.createMemory(scope, {
      title: 'Unique topic',
      content: 'standalone note',
      project: 'stewardship',
      summary: '',
      tags: [],
      favorite: false,
      level: 'note',
    });
  });

  afterEach(() => {
    resetD1Client();
    resetEnvCache();
  });

  function buildOrchestrator(): MemoryStewardshipOrchestrator {
    const repository = createTestMemoryRepository(mockDb);
    const relationRepository = createTestRelationRepository(mockDb);
    const consolidator = new MemoryConsolidator(repository, relationRepository);
    const searchGraphOrchestrator = new SearchGraphOrchestrator(
      new NoOpSearchIndexSyncer(),
      new NoOpGraphIndexSyncer(),
      new NoOpSearchGraphSyncStore(),
    );
    return new MemoryStewardshipOrchestrator(
      [
        new MetadataAuditTask(repository),
        new ConsolidationTask(consolidator),
        new GraphRepairTask(new NoOpRelationInferenceOrchestrator(), false),
        new EmbeddingAuditTask(repository),
        new IndexRepairTask(searchGraphOrchestrator, false),
        new RankingRefreshTask(new NoOpLearningOrchestrator(), false),
        new RetrievalOptimizationTask(repository, '1'),
      ],
      { runStore: new InMemoryStewardshipRunStore() },
    );
  }

  it('produces a full ordered report and detects duplicates in dry-run', async () => {
    const report = await buildOrchestrator().run(scope, { dryRun: true });

    expect(report.tasks.map((t) => t.stage)).toEqual([
      'metadata-repair',
      'merge-compress',
      'graph-repair',
      'embedding-repair',
      'index-repair',
      'ranking-refresh',
      'retrieval-optimization',
    ]);
    expect(report.dryRun).toBe(true);
    expect(report.totalChanged).toBe(0);

    const merge = report.tasks.find((t) => t.stage === 'merge-compress');
    expect(merge?.scanned).toBeGreaterThanOrEqual(2);

    const graph = report.tasks.find((t) => t.stage === 'graph-repair');
    expect(graph?.status).toBe('skipped');

    const index = report.tasks.find((t) => t.stage === 'index-repair');
    expect(index?.status).toBe('skipped');

    const ranking = report.tasks.find((t) => t.stage === 'ranking-refresh');
    expect(ranking?.status).toBe('skipped');

    const embedding = report.tasks.find((t) => t.stage === 'embedding-repair');
    expect(embedding?.findings.join(' ')).toMatch(/without embedding/);
  });

  it('archives duplicates when executed (not dry-run)', async () => {
    const report = await buildOrchestrator().run(scope, { dryRun: false });
    const merge = report.tasks.find((t) => t.stage === 'merge-compress');
    expect(merge?.changed).toBeGreaterThan(0);
  });

  it('composition root reflects MEMORY_STEWARDSHIP_ENABLED flag', () => {
    const ports = createMemoryStewardshipPorts(asSqlDatabase(mockDb), getEnv());
    expect(ports.enabled).toBe(false);
    expect(ports.orchestrator).toBeDefined();
    expect(ports.runStore).toBeDefined();
  });
});
