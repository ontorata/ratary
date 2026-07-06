import type { ConnectorId, ExternalKnowledgeItem } from '../types/connector.types.js';
import type { IFabricPolicy } from '../ports/ifabric-policy.port.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import type { IKnowledgeExchangeService } from '../../federation/ports/iknowledge-exchange.port.js';

/** Combines fabric ingest rules with federation peer visibility (Phase 32). */
export class UniversalFabricPolicy implements IFabricPolicy {
  constructor(
    private readonly base: IFabricPolicy,
    private readonly exchange: IKnowledgeExchangeService | null,
  ) {}

  async canIngest(connectorId: ConnectorId, scope: MemoryScope): Promise<boolean> {
    return this.base.canIngest(connectorId, scope);
  }

  async filterIngestable(
    items: ExternalKnowledgeItem[],
    connectorId: ConnectorId,
    scope: MemoryScope,
  ): Promise<ExternalKnowledgeItem[]> {
    return this.base.filterIngestable(items, connectorId, scope);
  }

  async canPullPeer(peerId: string, scope: MemoryScope): Promise<boolean> {
    if (!scope.ownerId || !this.exchange) return false;
    const peers = await this.exchange.listPeers(scope);
    return peers.some((p) => p.nodeId === peerId);
  }
}
