import type { IFederationTrustStore } from '../ports/ifederation-trust-store.port.js';
import type { FederatedMemoryBundle } from '../types/federated-memory.bundle.js';
import type { FederationCredentials } from '../types/federation-exchange.types.js';

/** Permissive trust for dev / in-process federation (ADR-029 Phase 14). */
export class NoOpFederationTrustStore implements IFederationTrustStore {
  async verifyPeer(_nodeId: string, _credentials?: FederationCredentials): Promise<boolean> {
    return true;
  }

  async signBundle(bundle: FederatedMemoryBundle): Promise<FederatedMemoryBundle> {
    return bundle;
  }

  async verifyBundle(_bundle: FederatedMemoryBundle): Promise<boolean> {
    return true;
  }
}
