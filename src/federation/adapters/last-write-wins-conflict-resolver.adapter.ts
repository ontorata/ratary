import type { IFederationConflictResolver } from '../ports/ifederation-conflict-resolver.port.js';
import type { FederatedMemoryRecord } from '../types/federated-memory.bundle.js';

/** Last-write-wins conflict resolution for inbound federation records. */
export class LastWriteWinsFederationConflictResolver implements IFederationConflictResolver {
  async resolve(
    local: FederatedMemoryRecord | null,
    inbound: FederatedMemoryRecord,
  ): Promise<'accept' | 'reject' | 'merge'> {
    if (!local) return 'accept';
    return inbound.updatedAt >= local.updatedAt ? 'merge' : 'reject';
  }
}
