import type { MemoryScope } from '../../types/memory-scope.js';
import type { IFederationMetadataStore } from '../ports/ifederation-metadata-store.port.js';
import type { IFederationPolicy } from '../ports/ifederation-policy.port.js';
import type { IFederationRegistry } from '../ports/ifederation-registry.port.js';
import type { FederationNodeDescriptor } from '../types/federation-node.descriptor.js';
import type { FederationScopeRef } from '../types/federation-scope-ref.js';

/** Config-driven federation authorization — fail closed on cross-org without trust (ADR-029). */
export class RuleBasedFederationPolicy implements IFederationPolicy {
  constructor(
    private readonly registry: IFederationRegistry,
    private readonly metadataStore: IFederationMetadataStore,
  ) {}

  async canExport(from: FederationScopeRef, to: FederationNodeDescriptor): Promise<boolean> {
    const local = await this.registry.getLocal();
    if (!local) return false;

    if (from.organizationId && to.nodeId !== local.nodeId) {
      const peer = await this.registry.getPeer(to.nodeId);
      if (!peer?.trusted) {
        const trusted = await this.metadataStore.isPeerTrusted(to.nodeId, from.organizationId);
        if (!trusted) return false;
      }
    }

    return true;
  }

  async canImport(from: FederationNodeDescriptor, to: MemoryScope): Promise<boolean> {
    const localOrg = to.organizationId;

    if (localOrg && !from.trusted) {
      const trusted = await this.metadataStore.isPeerTrusted(from.nodeId, localOrg);
      if (!trusted) return false;
    }

    return true;
  }

  async filterExportable(memoryIds: string[], _scope: MemoryScope): Promise<string[]> {
    return memoryIds;
  }
}
