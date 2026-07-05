import type { MemoryScope } from '../../types/memory-scope.js';
import type { FederationNodeDescriptor } from '../types/federation-node.descriptor.js';
import type { FederationScopeRef } from '../types/federation-scope-ref.js';
import type { FederationTrustContext } from '../types/federation-exchange.types.js';

export interface IFederationScopeMapper {
  toLocalScope(source: FederationScopeRef, trust: FederationTrustContext): Promise<MemoryScope>;
  toRemoteScope(
    local: MemoryScope,
    targetNode: FederationNodeDescriptor,
  ): Promise<FederationScopeRef>;
}
