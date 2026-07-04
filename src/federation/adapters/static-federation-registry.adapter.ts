import type { IFederationRegistry } from '../ports/ifederation-registry.port.js';
import type { FederationNodeDescriptor, FederationPeerFilter } from '../types/federation-node.descriptor.js';

/** In-memory peer registry from configured node list (ADR-029 Phase 14). */
export class StaticFederationRegistry implements IFederationRegistry {
  private localNode: FederationNodeDescriptor | null = null;

  constructor(private readonly peers: FederationNodeDescriptor[]) {}

  async registerLocal(node: FederationNodeDescriptor): Promise<void> {
    this.localNode = node;
  }

  async getLocal(): Promise<FederationNodeDescriptor | null> {
    return this.localNode;
  }

  async listPeers(filter?: FederationPeerFilter): Promise<FederationNodeDescriptor[]> {
    return this.peers.filter((peer) => {
      if (filter?.region && peer.region !== filter.region) return false;
      if (filter?.cloud && peer.cloud !== filter.cloud) return false;
      if (filter?.trustedOnly && !peer.trusted) return false;
      return true;
    });
  }

  async getPeer(nodeId: string): Promise<FederationNodeDescriptor | null> {
    if (this.localNode?.nodeId === nodeId) return this.localNode;
    return this.peers.find((peer) => peer.nodeId === nodeId) ?? null;
  }
}
