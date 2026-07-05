import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import { SqlMemoryVersionStore } from '../infrastructure/evolution/sql-memory-version-store.js';
import { SqlMemoryHeadStore } from '../infrastructure/evolution/sql-memory-head-store.js';
import { DefaultMemoryDiffEngine } from '../evolution/default-memory-diff-engine.js';
import { DefaultMemoryMergePolicy } from '../evolution/default-memory-merge-policy.js';
import { DefaultVersionConfidenceScorer } from '../evolution/default-version-confidence-scorer.js';
import {
  MemoryEvolutionCoordinator,
  NoOpMemoryEvolutionCoordinator,
} from '../evolution/memory-evolution-coordinator.js';
import { MemoryEvolutionService } from '../evolution/memory-evolution.service.js';
import type { IMemoryEvolutionCoordinator } from '../evolution/memory-evolution-coordinator.js';

export interface MemoryEvolutionPorts {
  enabled: boolean;
  coordinator: IMemoryEvolutionCoordinator;
  service?: MemoryEvolutionService;
  mergePolicy: DefaultMemoryMergePolicy;
}

/**
 * Composition root for Phase 09.7 memory evolution (ADR-040).
 * Gated by MEMORY_EVOLUTION_ENABLED; SQL stores when MEMORY_EVOLUTION_STORE_PROVIDER=sql.
 */
export function createMemoryEvolutionPorts(sql: ISqlDatabase, env: Env): MemoryEvolutionPorts {
  const mergePolicy = new DefaultMemoryMergePolicy();

  if (!env.MEMORY_EVOLUTION_ENABLED || env.MEMORY_EVOLUTION_STORE_PROVIDER !== 'sql') {
    return {
      enabled: false,
      coordinator: new NoOpMemoryEvolutionCoordinator(),
      mergePolicy,
    };
  }

  const versionStore = new SqlMemoryVersionStore(sql);
  const headStore = new SqlMemoryHeadStore(sql);
  const memoryRepository = new MemoryRepository(sql);
  const diffEngine = new DefaultMemoryDiffEngine();
  const confidenceScorer = new DefaultVersionConfidenceScorer();
  const coordinator = new MemoryEvolutionCoordinator(versionStore, headStore);

  return {
    enabled: true,
    coordinator,
    service: new MemoryEvolutionService(
      memoryRepository,
      memoryRepository,
      versionStore,
      headStore,
      diffEngine,
      confidenceScorer,
      mergePolicy,
      coordinator,
    ),
    mergePolicy,
  };
}
