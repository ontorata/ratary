import type { MemoryScope } from '../../types/memory-scope.js';
import type { IFederationScopeMapper } from '../ports/ifederation-scope-mapper.port.js';
import type { FederationNodeDescriptor } from '../types/federation-node.descriptor.js';
import type { FederationScopeRef } from '../types/federation-scope-ref.js';
import type { FederationTrustContext } from '../types/federation-exchange.types.js';

/** Maps federation scope refs to local MemoryScope (ADR-029 Phase 14). */
export class DefaultFederationScopeMapper implements IFederationScopeMapper {
  constructor(private readonly localNodeId: string) {}

  async toLocalScope(source: FederationScopeRef, _trust: FederationTrustContext): Promise<MemoryScope> {
    if (source.nodeId !== this.localNodeId) {
      // Remote source mapped to local owner/workspace on import target
      return {
        ownerId: source.ownerId,
        workspaceId: source.workspaceId,
        organizationId: source.organizationId,
        agentId: source.agentId,
      };
    }
    return {
      ownerId: source.ownerId,
      workspaceId: source.workspaceId,
      organizationId: source.organizationId,
      agentId: source.agentId,
    };
  }

  async toRemoteScope(
    local: MemoryScope,
    targetNode: FederationNodeDescriptor,
  ): Promise<FederationScopeRef> {
    return {
      nodeId: targetNode.nodeId,
      ownerId: local.ownerId,
      workspaceId: local.workspaceId,
      organizationId: local.organizationId,
      agentId: local.agentId,
      region: targetNode.region,
      cloud: targetNode.cloud,
    };
  }
}
