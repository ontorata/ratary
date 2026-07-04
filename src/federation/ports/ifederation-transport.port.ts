import type { FederatedMemoryBundle } from '../types/federated-memory.bundle.js';
import type {
  FederationPullRequest,
  FederationPushResult,
} from '../types/federation-exchange.types.js';

export interface IFederationTransport {
  pull(request: FederationPullRequest): Promise<FederatedMemoryBundle>;
  push(bundle: FederatedMemoryBundle): Promise<FederationPushResult>;
}
