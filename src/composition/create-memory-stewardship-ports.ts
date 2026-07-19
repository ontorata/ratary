import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import { MemoryRelationRepository } from '../repositories/memory-relation.repository.js';
import { MemoryConsolidator } from '../memory/consolidator.js';
import { RuleBasedCompressionPolicy } from '../memory/compression/rule-based-compression-policy.js';
import { createCompressionSummarizer } from './create-compression-summarizer.js';
import { createRelationInferencePorts } from './create-relation-inference-ports.js';
import { createSearchGraphPorts } from './create-search-graph-ports.js';
import { createLearningPorts } from './create-learning-ports.js';
import { MemoryStewardshipOrchestrator } from '../memory/stewardship/memory-stewardship-orchestrator.js';
import { InMemoryStewardshipRunStore } from '../memory/stewardship/in-memory-stewardship-run-store.js';
import { SqlStewardshipRunStore } from '../infrastructure/stewardship/sql-stewardship-run-store.js';
import { MetadataAuditTask } from '../memory/stewardship/tasks/metadata-audit.task.js';
import { ConsolidationTask } from '../memory/stewardship/tasks/consolidation.task.js';
import { GraphRepairTask } from '../memory/stewardship/tasks/graph-repair.task.js';
import { EmbeddingAuditTask } from '../memory/stewardship/tasks/embedding-audit.task.js';
import { IndexRepairTask } from '../memory/stewardship/tasks/index-repair.task.js';
import { RankingRefreshTask } from '../memory/stewardship/tasks/ranking-refresh.task.js';
import { RetrievalOptimizationTask } from '../memory/stewardship/tasks/retrieval-optimization.task.js';
import { DecayScoringTask } from '../memory/stewardship/tasks/decay-scoring.task.js';
import { WriteIntentCleanupTask } from '../memory/stewardship/tasks/write-intent-cleanup.task.js';
import { SqlWriteIntentStore } from '../infrastructure/write-intents/sql-write-intent-store.js';
import { parseDecayWeights } from '../memory/decay/index.js';
import { LocalStewardshipScheduler } from '../jobs/local-stewardship-scheduler.js';
import type { IMemoryStewardshipOrchestrator } from '../memory/stewardship/imemory-stewardship-orchestrator.interface.js';
import type { IStewardshipRunStore } from '../memory/stewardship/istewardship-run-store.interface.js';
import type { IStewardshipScheduler } from '../ports/stewardship/istewardship-scheduler.port.js';

export interface MemoryStewardshipPorts {
  enabled: boolean;
  orchestrator: IMemoryStewardshipOrchestrator;
  runStore: IStewardshipRunStore;
  scheduler?: IStewardshipScheduler;
}

/**
 * Composition root for Phase 04.7 stewardship (ADR-045).
 * Wires deterministic maintenance tasks in fixed stage order. Gated by
 * `MEMORY_STEWARDSHIP_ENABLED`; callers decide whether to invoke it.
 */
export function createMemoryStewardshipPorts(sql: ISqlDatabase, env: Env): MemoryStewardshipPorts {
  const repository = new MemoryRepository(sql);
  const relationRepository = new MemoryRelationRepository(sql);
  const compressionPolicy = env.COMPRESSION_ENABLED ? new RuleBasedCompressionPolicy() : undefined;
  const summarizer = createCompressionSummarizer(env);
  const consolidator = new MemoryConsolidator(repository, relationRepository, {
    compressionPolicy,
    compressionEnabled: env.COMPRESSION_ENABLED,
    summarizer,
  });

  const runStore =
    env.MEMORY_STEWARDSHIP_RUN_STORE_PROVIDER === 'sql'
      ? new SqlStewardshipRunStore(sql)
      : new InMemoryStewardshipRunStore();

  const relationInference = createRelationInferencePorts(sql, env);
  const searchGraph = createSearchGraphPorts(sql, env);
  const learning = createLearningPorts(sql, env);

  const orchestrator = new MemoryStewardshipOrchestrator(
    [
      new MetadataAuditTask(repository),
      new WriteIntentCleanupTask(new SqlWriteIntentStore(sql), env.WRITE_INTENT_TTL_DAYS),
      new ConsolidationTask(consolidator),
      new GraphRepairTask(relationInference.orchestrator, relationInference.enabled),
      new EmbeddingAuditTask(repository),
      new IndexRepairTask(searchGraph.orchestrator, searchGraph.enabled),
      new RankingRefreshTask(learning.orchestrator, learning.enabled),
      new RetrievalOptimizationTask(repository, env.RETRIEVAL_POLICY_VERSION),
      new DecayScoringTask(repository, repository, relationRepository, {
        enabled: env.DECAY_SCORING_ENABLED,
        halfLifeDays: env.DECAY_HALF_LIFE_DAYS,
        archiveFloor: env.DECAY_ARCHIVE_FLOOR,
        retentionDays: env.DECAY_RETENTION_DAYS,
        weights: parseDecayWeights(env.DECAY_WEIGHTS),
      }),
    ],
    { runStore },
  );

  const scheduler =
    env.MEMORY_STEWARDSHIP_SCHEDULER === 'local'
      ? new LocalStewardshipScheduler(orchestrator)
      : undefined;

  return { enabled: env.MEMORY_STEWARDSHIP_ENABLED, orchestrator, runStore, scheduler };
}
