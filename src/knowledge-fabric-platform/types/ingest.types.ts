import type { ConnectorId } from './connector.types.js';

export type FabricIngestMode = 'full' | 'incremental';
export type FabricIngestStatus = 'running' | 'completed' | 'failed';

export interface FabricIngestStats {
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  dryRun: boolean;
}

export interface FabricIngestInput {
  connectorId: ConnectorId;
  mode: FabricIngestMode;
  dryRun?: boolean;
  limit?: number;
}

export interface FabricIngestRun {
  id: string;
  connectorId: ConnectorId;
  mode: FabricIngestMode;
  status: FabricIngestStatus;
  ownerId?: string;
  workspaceId?: string;
  stats: FabricIngestStats;
  startedAt: string;
  finishedAt?: string;
  errorMessage?: string;
}

export interface FabricConnectorState {
  connectorId: ConnectorId;
  ownerId: string;
  workspaceId?: string;
  lastCursor: string;
  lastRunId?: string;
  updatedAt: string;
}

export interface KnowledgeFabricStatusResult {
  enabled: boolean;
  connectorCount: number;
  configuredConnectors: ConnectorId[];
}

export interface KnowledgeFabricPlatformManifest {
  platform: 'enterprise-knowledge-fabric';
  enabled: boolean;
  connectors: Array<{ id: ConnectorId; configured: boolean }>;
  supportsIncrementalIngest: boolean;
  lastRuns: Partial<
    Record<
      ConnectorId,
      Pick<FabricIngestRun, 'id' | 'status' | 'finishedAt' | 'connectorId'>
    >
  >;
}

export interface NormalizedFabricMemory {
  title: string;
  content: string;
  summary: string;
  tags: string[];
  project: string;
  notes: string;
}
