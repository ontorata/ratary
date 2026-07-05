import type { IFederationTrustStore } from '../ports/ifederation-trust-store.port.js';
import type { FederatedMemoryBundle } from '../types/federated-memory.bundle.js';
import type { FederationCredentials } from '../types/federation-exchange.types.js';
import type { IFederationRegistry } from '../ports/ifederation-registry.port.js';

/** Peer trust from registry `trusted` flag — production-safe default (ADR-029). */
export class RegistryFederationTrustStore implements IFederationTrustStore {
  constructor(private readonly registry: IFederationRegistry) {}

  async verifyPeer(nodeId: string, _credentials?: FederationCredentials): Promise<boolean> {
    const peer = await this.registry.getPeer(nodeId);
    return peer?.trusted === true;
  }

  async signBundle(bundle: FederatedMemoryBundle): Promise<FederatedMemoryBundle> {
    return bundle;
  }

  async verifyBundle(bundle: FederatedMemoryBundle): Promise<boolean> {
    return this.verifyPeer(bundle.source.nodeId);
  }
}
