import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import { generateId, nowISO } from '../../utils/memory-mapper.js';
import type { ITenantMetadataStore } from '../../cloud/ports/itenant-metadata-store.port.js';
import type {
  ProvisionWorkspaceInput,
  TenantMetadataRecord,
  TenantMetadataStatus,
} from '../../cloud/types/tenant.types.js';

interface TenantRow {
  id: string;
  organization_id: string;
  workspace_id: string;
  owner_id: string;
  department_id: string | null;
  tenant_project_id: string | null;
  primary_region_id: string;
  secondary_region_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function mapTenant(row: TenantRow): TenantMetadataRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    workspaceId: row.workspace_id,
    ownerId: row.owner_id,
    departmentId: row.department_id ?? undefined,
    tenantProjectId: row.tenant_project_id ?? undefined,
    primaryRegionId: row.primary_region_id,
    secondaryRegionId: row.secondary_region_id ?? undefined,
    status: row.status as TenantMetadataStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** SQL-backed tenant metadata store (Phase 18). */
export class SqlTenantMetadataStore implements ITenantMetadataStore {
  constructor(private readonly sql: ISqlDatabase) {}

  async upsert(
    input: ProvisionWorkspaceInput & { primaryRegionId: string },
  ): Promise<TenantMetadataRecord> {
    const existing = await this.findByWorkspace(input.organizationId, input.workspaceId);
    const updatedAt = nowISO();

    if (existing) {
      await this.sql.execute(
        `UPDATE cloud_tenant_metadata
         SET owner_id = ?, department_id = ?, tenant_project_id = ?,
             primary_region_id = ?, secondary_region_id = ?, status = 'active', updated_at = ?
         WHERE organization_id = ? AND workspace_id = ?`,
        [
          input.ownerId,
          input.departmentId ?? null,
          input.tenantProjectId ?? null,
          input.primaryRegionId,
          input.secondaryRegionId ?? null,
          updatedAt,
          input.organizationId,
          input.workspaceId,
        ],
      );
      const updated = await this.findByWorkspace(input.organizationId, input.workspaceId);
      if (!updated) throw new Error('Failed to update tenant metadata');
      return updated;
    }

    const id = generateId();
    const createdAt = updatedAt;
    await this.sql.execute(
      `INSERT INTO cloud_tenant_metadata
       (id, organization_id, workspace_id, owner_id, department_id, tenant_project_id,
        primary_region_id, secondary_region_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        id,
        input.organizationId,
        input.workspaceId,
        input.ownerId,
        input.departmentId ?? null,
        input.tenantProjectId ?? null,
        input.primaryRegionId,
        input.secondaryRegionId ?? null,
        createdAt,
        updatedAt,
      ],
    );

    return {
      id,
      organizationId: input.organizationId,
      workspaceId: input.workspaceId,
      ownerId: input.ownerId,
      departmentId: input.departmentId,
      tenantProjectId: input.tenantProjectId,
      primaryRegionId: input.primaryRegionId,
      secondaryRegionId: input.secondaryRegionId,
      status: 'active',
      createdAt,
      updatedAt,
    };
  }

  async findByWorkspace(
    organizationId: string,
    workspaceId: string,
  ): Promise<TenantMetadataRecord | null> {
    const rows = await this.sql.query<TenantRow>(
      `SELECT id, organization_id, workspace_id, owner_id, department_id, tenant_project_id,
              primary_region_id, secondary_region_id, status, created_at, updated_at
       FROM cloud_tenant_metadata
       WHERE organization_id = ? AND workspace_id = ?`,
      [organizationId, workspaceId],
    );
    return rows[0] ? mapTenant(rows[0]) : null;
  }

  async updateStatus(
    organizationId: string,
    workspaceId: string,
    status: TenantMetadataStatus,
  ): Promise<TenantMetadataRecord> {
    const updatedAt = nowISO();
    await this.sql.execute(
      `UPDATE cloud_tenant_metadata SET status = ?, updated_at = ?
       WHERE organization_id = ? AND workspace_id = ?`,
      [status, updatedAt, organizationId, workspaceId],
    );
    const record = await this.findByWorkspace(organizationId, workspaceId);
    if (!record) throw new Error('Tenant metadata not found');
    return record;
  }

  async updateRegions(
    organizationId: string,
    workspaceId: string,
    primaryRegionId: string,
    secondaryRegionId?: string,
  ): Promise<TenantMetadataRecord> {
    const updatedAt = nowISO();
    await this.sql.execute(
      `UPDATE cloud_tenant_metadata
       SET primary_region_id = ?, secondary_region_id = ?, updated_at = ?
       WHERE organization_id = ? AND workspace_id = ?`,
      [primaryRegionId, secondaryRegionId ?? null, updatedAt, organizationId, workspaceId],
    );
    const record = await this.findByWorkspace(organizationId, workspaceId);
    if (!record) throw new Error('Tenant metadata not found');
    return record;
  }

  async listByOrganization(organizationId: string): Promise<TenantMetadataRecord[]> {
    const rows = await this.sql.query<TenantRow>(
      `SELECT id, organization_id, workspace_id, owner_id, department_id, tenant_project_id,
              primary_region_id, secondary_region_id, status, created_at, updated_at
       FROM cloud_tenant_metadata
       WHERE organization_id = ? ORDER BY created_at`,
      [organizationId],
    );
    return rows.map(mapTenant);
  }
}
