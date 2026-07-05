export type TenantMetadataStatus = 'active' | 'deprovisioned';

export interface TenantMetadataRecord {
  id: string;
  organizationId: string;
  workspaceId: string;
  ownerId: string;
  departmentId?: string;
  tenantProjectId?: string;
  primaryRegionId: string;
  secondaryRegionId?: string;
  status: TenantMetadataStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProvisionWorkspaceInput {
  organizationId: string;
  workspaceId: string;
  ownerId: string;
  departmentId?: string;
  tenantProjectId?: string;
  primaryRegionId?: string;
  secondaryRegionId?: string;
}

export interface TenantTopology {
  organizationId: string;
  workspaceId: string;
  ownerId: string;
  /** ISO timestamp when topology was assembled (live read — not cached). */
  generatedAt: string;
  status: TenantMetadataStatus;
  primaryRegion: {
    id: string;
    code: string;
    displayName: string;
  };
  secondaryRegion?: {
    id: string;
    code: string;
    displayName: string;
  };
  readPreference: 'primary' | 'secondary' | 'nearest';
  federation?: {
    localNodeId: string;
    peersInPrimaryRegion: Array<{ nodeId: string; region?: string; displayName?: string }>;
    peersInSecondaryRegion: Array<{ nodeId: string; region?: string; displayName?: string }>;
  };
}
