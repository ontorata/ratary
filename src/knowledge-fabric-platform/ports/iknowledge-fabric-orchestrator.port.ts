import type { ConnectorDescriptor, ConnectorId } from '../types/connector.types.js';
import type { IKnowledgeConnector } from './iknowledge-connector.port.js';
import type {
  FabricIngestInput,
  FabricIngestRun,
  KnowledgeFabricStatusResult,
} from '../types/ingest.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import type { FabricConnectorState } from '../types/ingest.types.js';

/** Orchestrates external knowledge ingest into MemoryService SSOT (Phase 23). */
export interface IKnowledgeFabricOrchestrator {
  ingest(
    input: FabricIngestInput,
    scope: MemoryScope,
    connectorOverride?: IKnowledgeConnector,
  ): Promise<FabricIngestRun>;
  listRuns(limit?: number): Promise<FabricIngestRun[]>;
  listConnectors(): ConnectorDescriptor[];
  getConnectorState(
    connectorId: ConnectorId,
    scope: MemoryScope,
  ): Promise<FabricConnectorState | null>;
  getStatus(): Promise<KnowledgeFabricStatusResult>;
}
