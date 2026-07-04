import type { ConnectorId, ExternalKnowledgeItem } from '../types/connector.types.js';
import type { IFabricPolicy } from '../ports/ifabric-policy.port.js';
import type { MemoryScope } from '../../types/memory-scope.js';

/** Fail-closed fabric policy — requires authenticated scope (Phase 23). */
export class RuleBasedFabricPolicy implements IFabricPolicy {
  async canIngest(_connectorId: ConnectorId, scope: MemoryScope): Promise<boolean> {
    return Boolean(scope.ownerId);
  }

  async filterIngestable(
    items: ExternalKnowledgeItem[],
    _connectorId: ConnectorId,
    _scope: MemoryScope,
  ): Promise<ExternalKnowledgeItem[]> {
    return items.filter((item) => item.externalId && item.title && item.body);
  }
}

export class DenyAllFabricPolicy implements IFabricPolicy {
  async canIngest(): Promise<boolean> {
    return false;
  }

  async filterIngestable(): Promise<ExternalKnowledgeItem[]> {
    return [];
  }
}
