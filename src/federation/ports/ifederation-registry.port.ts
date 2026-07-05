import type {
  FederationNodeDescriptor,
  FederationPeerFilter,
} from '../types/federation-node.descriptor.js';

export interface IFederationRegistry {
  registerLocal(node: FederationNodeDescriptor): Promise<void>;
  getLocal(): Promise<FederationNodeDescriptor | null>;
  listPeers(filter?: FederationPeerFilter): Promise<FederationNodeDescriptor[]>;
  getPeer(nodeId: string): Promise<FederationNodeDescriptor | null>;
}
