import type {
  AssignRegionInput,
  CloudRegion,
  WorkspaceRegionAssignment,
} from '../types/region.types.js';
import type {
  ProvisionWorkspaceInput,
  TenantMetadataRecord,
  TenantTopology,
} from '../types/tenant.types.js';

export interface RotateApiKeyResult {
  identityId: string;
  apiKey?: string;
  oauthToken?: string;
}

/** Control plane metadata orchestration — does not call MemoryService (ADR-033). */
export interface IControlPlane {
  provisionWorkspace(input: ProvisionWorkspaceInput): Promise<TenantMetadataRecord>;
  deprovisionWorkspace(organizationId: string, workspaceId: string): Promise<TenantMetadataRecord>;
  assignRegion(
    organizationId: string,
    workspaceId: string,
    input: AssignRegionInput,
  ): Promise<WorkspaceRegionAssignment>;
  rotateApiKey(identityId: string, actorOwnerId: string): Promise<RotateApiKeyResult>;
  getTenantTopology(organizationId: string, workspaceId: string): Promise<TenantTopology>;
  listRegions(): Promise<CloudRegion[]>;
}
