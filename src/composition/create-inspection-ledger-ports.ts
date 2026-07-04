import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { SqlInspectionPatternStore } from '../infrastructure/learning/sql-inspection-pattern-store.js';
import { SqlLearningEventStore } from '../infrastructure/learning/sql-learning-event-store.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import { InspectionLedgerOrchestrator } from '../learning/inspection/inspection-ledger-orchestrator.js';
import { NoOpInspectionLedgerOrchestrator } from '../learning/inspection/noop-inspection-ledger-orchestrator.js';
import type { IInspectionLedgerOrchestrator } from '../learning/inspection/iinspection-ledger-orchestrator.interface.js';
import type { IInspectionPatternStore } from '../learning/inspection/iinspection-pattern-store.interface.js';

export interface InspectionLedgerPorts {
  enabled: boolean;
  orchestrator: IInspectionLedgerOrchestrator;
  patternStore?: IInspectionPatternStore;
}

/**
 * Composition root for Phase 8.8 Inspection Pattern Ledger (ADR-059).
 * Requires LEARNING_ENGINE_ENABLED + SQL stores for event feed.
 */
export function createInspectionLedgerPorts(sql: ISqlDatabase, env: Env): InspectionLedgerPorts {
  if (
    !env.INSPECTION_LEDGER_ENABLED ||
    env.INSPECTION_LEDGER_STORE_PROVIDER !== 'sql' ||
    !env.LEARNING_ENGINE_ENABLED ||
    env.LEARNING_STORE_PROVIDER !== 'sql'
  ) {
    return { enabled: false, orchestrator: new NoOpInspectionLedgerOrchestrator() };
  }

  const patternStore = new SqlInspectionPatternStore(sql);
  const eventStore = new SqlLearningEventStore(sql);
  const memoryRepository = new MemoryRepository(sql);

  return {
    enabled: true,
    patternStore,
    orchestrator: new InspectionLedgerOrchestrator({
      eventStore,
      patternStore,
      memoryRepository,
      env,
    }),
  };
}
