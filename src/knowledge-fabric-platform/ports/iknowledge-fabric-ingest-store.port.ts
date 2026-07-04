import type { ConnectorId } from '../types/connector.types.js';
import type { FabricIngestRun } from '../types/ingest.types.js';

/** Ingest run audit trail (Phase 23). */
export interface IKnowledgeFabricIngestStore {
  startRun(run: Omit<FabricIngestRun, 'finishedAt' | 'errorMessage'>): Promise<void>;
  completeRun(
    runId: string,
    update: Pick<FabricIngestRun, 'status' | 'stats' | 'finishedAt' | 'errorMessage'>,
  ): Promise<void>;
  listRuns(limit?: number): Promise<FabricIngestRun[]>;
  getLatestRun(connectorId: ConnectorId): Promise<FabricIngestRun | null>;
}
