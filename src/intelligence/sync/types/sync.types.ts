export const SYNC_TIERS = ['workspace', 'organization', 'cloud', 'edge', 'developer'] as const;
export type SyncTier = (typeof SYNC_TIERS)[number];

export type SyncDirection = 'pull' | 'push' | 'bidirectional';

export interface GlobalSyncRequest {
  tier: SyncTier;
  direction: SyncDirection;
  since?: string;
  dryRun?: boolean;
  peerId?: string;
}

export interface GlobalSyncResult {
  tier: SyncTier;
  direction: SyncDirection;
  accepted: number;
  rejected: number;
  cursor?: string;
  dryRun: boolean;
}

export interface GlobalSyncStatus {
  tiers: Partial<
    Record<
      SyncTier,
      {
        lastCursor?: string;
        lastSyncAt?: string;
        lagMs?: number;
      }
    >
  >;
}

export interface SyncJournalEntry {
  id: string;
  ownerId: string;
  workspaceId?: string;
  action: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'applied';
  createdAt: string;
  appliedAt?: string;
}

export interface GlobalIntelligencePlatformManifest {
  platform: 'global-ai-intelligence';
  enabled: boolean;
  telemetryEnabled: boolean;
  analyticsEnabled: boolean;
  syncEnabled: boolean;
  composedPhases: string[];
  syncTiers: SyncTier[];
  telemetryEventCount: number;
}
