import type { ConnectorId } from '../types/connector.types.js';
import type { FabricConnectorState } from '../types/ingest.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';

export interface FabricExternalRef {
  connectorId: ConnectorId;
  externalId: string;
  memoryId: string;
  ownerId: string;
  workspaceId?: string;
  externalUpdatedAt: string;
  updatedAt: string;
}

/** Maps external IDs to memory SSOT rows (Phase 23). */
export interface IFabricExternalRefStore {
  findByExternalRef(
    connectorId: ConnectorId,
    externalId: string,
    scope: MemoryScope,
  ): Promise<FabricExternalRef | null>;
  upsert(ref: FabricExternalRef): Promise<void>;
  getCursor(connectorId: ConnectorId, scope: MemoryScope): Promise<string | null>;
  setCursor(
    connectorId: ConnectorId,
    scope: MemoryScope,
    cursor: string,
    runId?: string,
  ): Promise<void>;
  getConnectorState(
    connectorId: ConnectorId,
    scope: MemoryScope,
  ): Promise<FabricConnectorState | null>;
}
