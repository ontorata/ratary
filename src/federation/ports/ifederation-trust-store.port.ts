import type { FederatedMemoryBundle } from '../types/federated-memory.bundle.js';
import type { FederationCredentials } from '../types/federation-exchange.types.js';

export interface IFederationTrustStore {
  verifyPeer(nodeId: string, credentials?: FederationCredentials): Promise<boolean>;
  signBundle(bundle: FederatedMemoryBundle): Promise<FederatedMemoryBundle>;
  verifyBundle(bundle: FederatedMemoryBundle): Promise<boolean>;
}
