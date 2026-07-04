import type { ConnectorId, ExternalKnowledgeItem } from '../types/connector.types.js';
import type { NormalizedFabricMemory } from '../types/ingest.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';

export interface FabricNormalizeContext {
  connectorId: ConnectorId;
  scope: MemoryScope;
}

/** Maps external items to MemoryService create/update payloads (Phase 23). */
export interface IFabricNormalizer {
  normalize(
    item: ExternalKnowledgeItem,
    ctx: FabricNormalizeContext,
  ): NormalizedFabricMemory | null;
}
