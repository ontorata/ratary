import type { MemoryScope } from '../../types/memory-scope.js';
import type { IFederationMetadataStore } from '../ports/ifederation-metadata-store.port.js';
import type { FederationExchangeResult } from '../types/federation-exchange.types.js';

/** No-op metadata store when federation SQL is disabled. */
export class NoOpFederationMetadataStore implements IFederationMetadataStore {
  async getSyncCursor(_peerId: string, _scope: MemoryScope): Promise<string | null> {
    return null;
  }

  async setSyncCursor(_peerId: string, _scope: MemoryScope, _cursor: string): Promise<void> {
    // no-op
  }

  async recordExchange(_result: FederationExchangeResult): Promise<void> {
    // no-op
  }

  async getLastExchangeAt(_peerId: string): Promise<string | null> {
    return null;
  }

  async upsertPeerTrust(_peerId: string, _trusted: boolean, _organizationId?: string): Promise<void> {
    // no-op
  }

  async isPeerTrusted(_peerId: string, _organizationId?: string): Promise<boolean> {
    return false;
  }
}
