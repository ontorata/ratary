import type { ConnectorId, ExternalKnowledgeItem } from '../types/connector.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';

/** Authorization gate for fabric ingest (Phase 23). */
export interface IFabricPolicy {
  canIngest(connectorId: ConnectorId, scope: MemoryScope): Promise<boolean>;
  filterIngestable(
    items: ExternalKnowledgeItem[],
    connectorId: ConnectorId,
    scope: MemoryScope,
  ): Promise<ExternalKnowledgeItem[]>;
}
