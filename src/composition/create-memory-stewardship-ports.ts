import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import { MemoryRelationRepository } from '../repositories/memory-relation.repository.js';
import { MemoryConsolidator } from '../memory/consolidator.js';
import { RuleBasedCompressionPolicy } from '../memory/compression/rule-based-compression-policy.js';
import { MemoryStewardshipOrchestrator } from '../memory/stewardship/memory-stewardship-orchestrator.js';
import { InMemoryStewardshipRunStore } from '../memory/stewardship/in-memory-stewardship-run-store.js';
import { MetadataAuditTask } from '../memory/stewardship/tasks/metadata-audit.task.js';
import { ConsolidationTask } from '../memory/stewardship/tasks/consolidation.task.js';
import { EmbeddingAuditTask } from '../memory/stewardship/tasks/embedding-audit.task.js';
import { RetrievalOptimizationTask } from '../memory/stewardship/tasks/retrieval-optimization.task.js';
import type { IMemoryStewardshipOrchestrator } from '../memory/stewardship/imemory-stewardship-orchestrator.interface.js';
import type { IStewardshipRunStore } from '../memory/stewardship/istewardship-run-store.interface.js';

export interface MemoryStewardshipPorts {
  enabled: boolean;
  orchestrator: IMemoryStewardshipOrchestrator;
  runStore: IStewardshipRunStore;
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
  const consolidator = new MemoryConsolidator(repository, relationRepository, {
    compressionPolicy,
    compressionEnabled: env.COMPRESSION_ENABLED,
  });

  const runStore = new InMemoryStewardshipRunStore();
  const orchestrator = new MemoryStewardshipOrchestrator(
    [
      new MetadataAuditTask(repository),
      new ConsolidationTask(consolidator),
      new EmbeddingAuditTask(repository),
      new RetrievalOptimizationTask(repository, env.RETRIEVAL_POLICY_VERSION),
    ],
    { runStore },
  );

  return { enabled: env.MEMORY_STEWARDSHIP_ENABLED, orchestrator, runStore };
}
