import type { MemoryScope } from '../../types/memory-scope.js';
import type { FederationNodeDescriptor } from '../types/federation-node.descriptor.js';
import type { FederationScopeRef } from '../types/federation-scope-ref.js';

export interface IFederationPolicy {
  canExport(from: FederationScopeRef, to: FederationNodeDescriptor): Promise<boolean>;
  canImport(from: FederationNodeDescriptor, to: MemoryScope): Promise<boolean>;
  filterExportable(memoryIds: string[], scope: MemoryScope): Promise<string[]>;
}
