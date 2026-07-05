import type {
  ProvisionWorkspaceInput,
  TenantMetadataRecord,
  TenantMetadataStatus,
} from '../types/tenant.types.js';

export interface ITenantMetadataStore {
  upsert(
    input: ProvisionWorkspaceInput & { primaryRegionId: string },
  ): Promise<TenantMetadataRecord>;
  findByWorkspace(
    organizationId: string,
    workspaceId: string,
  ): Promise<TenantMetadataRecord | null>;
  updateStatus(
    organizationId: string,
    workspaceId: string,
    status: TenantMetadataStatus,
  ): Promise<TenantMetadataRecord>;
  updateRegions(
    organizationId: string,
    workspaceId: string,
    primaryRegionId: string,
    secondaryRegionId?: string,
  ): Promise<TenantMetadataRecord>;
  listByOrganization(organizationId: string): Promise<TenantMetadataRecord[]>;
}
