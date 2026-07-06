/** Source kinds for universal memory fabric (Phase 32). */
export type FabricSourceKind = 'connector' | 'federation_peer';

export interface FabricProvenanceRecord {
  sourceKind: FabricSourceKind;
  /** Connector id or federation peer node id */
  sourceId: string;
  externalId: string;
  memoryId: string;
  ownerId: string;
  workspaceId?: string;
  externalUpdatedAt: string;
  metadata?: Record<string, unknown>;
  updatedAt: string;
}

export interface FabricPeerPullInput {
  peerId: string;
  dryRun?: boolean;
  limit?: number;
  cursor?: string | null;
}

export interface FabricPeerPullResult {
  peerId: string;
  accepted: number;
  rejected: number;
  bundleId?: string;
  cursor?: string | null;
  dryRun: boolean;
  timestamp: string;
}
