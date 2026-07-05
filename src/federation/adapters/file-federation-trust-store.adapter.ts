import { readFile } from 'node:fs/promises';
import type { IFederationTrustStore } from '../ports/ifederation-trust-store.port.js';
import type { FederatedMemoryBundle } from '../types/federated-memory.bundle.js';
import type { FederationCredentials } from '../types/federation-exchange.types.js';

interface TrustFilePayload {
  trustedPeerIds?: string[];
}

/** File-backed trusted peer allowlist for federation (ADR-029). */
export class FileFederationTrustStore implements IFederationTrustStore {
  private trustedPeerIds: Set<string> | null = null;

  constructor(private readonly trustFilePath: string) {}

  async verifyPeer(nodeId: string, _credentials?: FederationCredentials): Promise<boolean> {
    const trusted = await this.loadTrustedPeerIds();
    return trusted.has(nodeId);
  }

  async signBundle(bundle: FederatedMemoryBundle): Promise<FederatedMemoryBundle> {
    return bundle;
  }

  async verifyBundle(bundle: FederatedMemoryBundle): Promise<boolean> {
    return this.verifyPeer(bundle.source.nodeId);
  }

  private async loadTrustedPeerIds(): Promise<Set<string>> {
    if (this.trustedPeerIds) return this.trustedPeerIds;

    const raw = await readFile(this.trustFilePath, 'utf8');
    const parsed = JSON.parse(raw) as TrustFilePayload;
    const ids = Array.isArray(parsed.trustedPeerIds) ? parsed.trustedPeerIds : [];
    this.trustedPeerIds = new Set(ids.filter((id): id is string => typeof id === 'string' && id.length > 0));
    return this.trustedPeerIds;
  }
}
