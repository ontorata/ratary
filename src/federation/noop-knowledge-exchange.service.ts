import type { MemoryScope } from '../types/memory-scope.js';
import type { IKnowledgeExchangeService } from './ports/iknowledge-exchange.port.js';
import type { FederationNodeDescriptor } from './types/federation-node.descriptor.js';
import type {
  FederationExchangeResult,
  FederationPullRequest,
  FederationStatusResult,
} from './types/federation-exchange.types.js';

/** No-op when FEDERATION_ENABLED=false. */
export class NoOpKnowledgeExchangeService implements IKnowledgeExchangeService {
  async pullAndApply(
    _peerId: string,
    _request: FederationPullRequest,
    _localScope: MemoryScope,
  ): Promise<FederationExchangeResult> {
    throw new Error('Federation is disabled');
  }

  async pushToPeer(
    _peerId: string,
    _memoryIds: string[],
    _localScope: MemoryScope,
  ): Promise<FederationExchangeResult> {
    throw new Error('Federation is disabled');
  }

  async listPeers(_localScope: MemoryScope): Promise<FederationNodeDescriptor[]> {
    return [];
  }

  async getStatus(_localScope: MemoryScope): Promise<FederationStatusResult> {
    return { enabled: false, nodeId: '', peerCount: 0, peers: [] };
  }
}
