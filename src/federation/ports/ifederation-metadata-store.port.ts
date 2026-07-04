import type { MemoryScope } from '../../types/memory-scope.js';
import type { FederationExchangeResult } from '../types/federation-exchange.types.js';

export interface IFederationMetadataStore {
  getSyncCursor(peerId: string, scope: MemoryScope): Promise<string | null>;
  setSyncCursor(peerId: string, scope: MemoryScope, cursor: string): Promise<void>;
  recordExchange(result: FederationExchangeResult): Promise<void>;
  getLastExchangeAt(peerId: string): Promise<string | null>;
  upsertPeerTrust(peerId: string, trusted: boolean, organizationId?: string): Promise<void>;
  isPeerTrusted(peerId: string, organizationId?: string): Promise<boolean>;
}
