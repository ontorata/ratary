import type { MemoryScope } from '../../types/memory-scope.js';
import type { IKnowledgeFabricOrchestrator } from '../ports/iknowledge-fabric-orchestrator.port.js';
import type { ConnectorId } from '../types/connector.types.js';
import type { FabricIngestInput, FabricIngestRun } from '../types/ingest.types.js';
import { newFabricIngestRunId } from '../../infrastructure/knowledge-fabric-platform/sql-knowledge-fabric-store.js';

export interface ConnectorSyncJobRecord {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  run?: FabricIngestRun;
  errorMessage?: string;
}

/** In-process async sync jobs — off HTTP hot path (Phase 29A). */
export class ConnectorSyncJobRunner {
  private readonly jobs = new Map<string, ConnectorSyncJobRecord>();

  constructor(private readonly orchestrator: IKnowledgeFabricOrchestrator) {}

  enqueue(input: FabricIngestInput, scope: MemoryScope): string {
    const jobId = newFabricIngestRunId();
    this.jobs.set(jobId, { id: jobId, status: 'queued' });

    void this.runJob(jobId, input, scope);

    return jobId;
  }

  getJob(jobId: string): ConnectorSyncJobRecord | undefined {
    return this.jobs.get(jobId);
  }

  private async runJob(
    jobId: string,
    input: FabricIngestInput,
    scope: MemoryScope,
  ): Promise<void> {
    this.jobs.set(jobId, { id: jobId, status: 'running' });
    try {
      const run = await this.orchestrator.ingest(input, scope);
      this.jobs.set(jobId, { id: jobId, status: 'completed', run });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.jobs.set(jobId, { id: jobId, status: 'failed', errorMessage: message });
    }
  }
}

export type ConnectorIdForWebhook = ConnectorId;
