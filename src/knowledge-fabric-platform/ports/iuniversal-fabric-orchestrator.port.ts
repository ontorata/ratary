import type { IKnowledgeFabricOrchestrator } from './iknowledge-fabric-orchestrator.port.js';
import type {
  FabricPeerPullInput,
  FabricPeerPullResult,
  FabricProvenanceRecord,
} from '../types/fabric-provenance.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';

/** Extends fabric orchestrator with cross-org federation pull (Phase 32). */
export interface IUniversalFabricOrchestrator extends IKnowledgeFabricOrchestrator {
  pullFromPeer(input: FabricPeerPullInput, scope: MemoryScope): Promise<FabricPeerPullResult>;
  listProvenance(scope: MemoryScope, limit?: number): Promise<FabricProvenanceRecord[]>;
}
