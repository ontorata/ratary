import type { FabricProvenanceRecord, FabricSourceKind } from '../types/fabric-provenance.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';

/** Unified provenance index for connector + federation sources (Phase 32). */
export interface IFabricProvenanceStore {
  upsert(record: FabricProvenanceRecord): Promise<void>;
  findBySourceRef(
    sourceKind: FabricSourceKind,
    sourceId: string,
    externalId: string,
    scope: MemoryScope,
  ): Promise<FabricProvenanceRecord | null>;
  listByScope(scope: MemoryScope, limit?: number): Promise<FabricProvenanceRecord[]>;
}
