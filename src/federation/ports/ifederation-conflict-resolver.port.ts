import type { FederatedMemoryRecord } from '../types/federated-memory.bundle.js';

export type FederationConflictDecision = 'accept' | 'reject' | 'merge';

export interface IFederationConflictResolver {
  resolve(
    local: FederatedMemoryRecord | null,
    inbound: FederatedMemoryRecord,
  ): Promise<FederationConflictDecision>;
}
