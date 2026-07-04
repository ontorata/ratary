import type { MemoryScope } from '../../types/memory-scope.js';
import type { FederationNodeDescriptor } from '../types/federation-node.descriptor.js';
import type {
  FederationExchangeResult,
  FederationPullRequest,
  FederationStatusResult,
} from '../types/federation-exchange.types.js';

export interface IKnowledgeExchangeService {
  pullAndApply(
    peerId: string,
    request: FederationPullRequest,
    localScope: MemoryScope,
  ): Promise<FederationExchangeResult>;

  pushToPeer(
    peerId: string,
    memoryIds: string[],
    localScope: MemoryScope,
  ): Promise<FederationExchangeResult>;

  listPeers(localScope: MemoryScope): Promise<FederationNodeDescriptor[]>;

  getStatus(localScope: MemoryScope): Promise<FederationStatusResult>;
}
