import { randomUUID } from 'node:crypto';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import { generateId, nowISO } from '../../utils/memory-mapper.js';
import type { IRegionRegistry } from '../ports/iregion-registry.port.js';
import type {
  AssignRegionInput,
  CloudRegion,
  WorkspaceRegionAssignment,
} from '../types/region.types.js';

interface RegionRow {
  id: string;
  code: string;
  display_name: string;
  cloud_provider: string | null;
  is_active: number;
  created_at: string;
}

interface AssignmentRow {
  workspace_id: string;
  owner_id: string;
  primary_region_id: string;
  secondary_region_id: string | null;
  read_preference: string;
  updated_at: string;
}

function mapRegion(row: RegionRow): CloudRegion {
  return {
    id: row.id,
    code: row.code,
    displayName: row.display_name,
    cloudProvider: row.cloud_provider ?? undefined,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  };
}

function mapAssignment(row: AssignmentRow): WorkspaceRegionAssignment {
  return {
    workspaceId: row.workspace_id,
    ownerId: row.owner_id,
    primaryRegionId: row.primary_region_id,
    secondaryRegionId: row.secondary_region_id ?? undefined,
    readPreference: row.read_preference as WorkspaceRegionAssignment['readPreference'],
    updatedAt: row.updated_at,
  };
}

/** SQL-backed region registry (Phase 18). */
export class SqlRegionRegistry implements IRegionRegistry {
  constructor(private readonly sql: ISqlDatabase) {}

  async ensureDefaultRegion(code: string, displayName: string): Promise<CloudRegion> {
    const existing = await this.getRegionByCode(code);
    if (existing) return existing;
    return this.registerRegion({ code, displayName });
  }

  async registerRegion(input: {
    code: string;
    displayName: string;
    cloudProvider?: string;
  }): Promise<CloudRegion> {
    const id = generateId();
    const createdAt = nowISO();
    await this.sql.execute(
      `INSERT INTO cloud_regions (id, code, display_name, cloud_provider, is_active, created_at)
       VALUES (?, ?, ?, ?, 1, ?)`,
      [id, input.code, input.displayName, input.cloudProvider ?? null, createdAt],
    );
    return {
      id,
      code: input.code,
      displayName: input.displayName,
      cloudProvider: input.cloudProvider,
      isActive: true,
      createdAt,
    };
  }

  async getRegionById(id: string): Promise<CloudRegion | null> {
    const rows = await this.sql.query<RegionRow>(
      `SELECT id, code, display_name, cloud_provider, is_active, created_at
       FROM cloud_regions WHERE id = ?`,
      [id],
    );
    return rows[0] ? mapRegion(rows[0]) : null;
  }

  async getRegionByCode(code: string): Promise<CloudRegion | null> {
    const rows = await this.sql.query<RegionRow>(
      `SELECT id, code, display_name, cloud_provider, is_active, created_at
       FROM cloud_regions WHERE code = ?`,
      [code],
    );
    return rows[0] ? mapRegion(rows[0]) : null;
  }

  async listRegions(): Promise<CloudRegion[]> {
    const rows = await this.sql.query<RegionRow>(
      `SELECT id, code, display_name, cloud_provider, is_active, created_at
       FROM cloud_regions WHERE is_active = 1 ORDER BY code`,
    );
    return rows.map(mapRegion);
  }

  async assignWorkspaceRegion(
    workspaceId: string,
    ownerId: string,
    input: AssignRegionInput,
  ): Promise<WorkspaceRegionAssignment> {
    const updatedAt = nowISO();
    const readPreference = input.readPreference ?? 'primary';
    const existing = await this.getWorkspaceAssignment(workspaceId);

    if (existing) {
      await this.sql.execute(
        `UPDATE cloud_workspace_regions
         SET primary_region_id = ?, secondary_region_id = ?, read_preference = ?, updated_at = ?
         WHERE workspace_id = ?`,
        [
          input.primaryRegionId,
          input.secondaryRegionId ?? null,
          readPreference,
          updatedAt,
          workspaceId,
        ],
      );
    } else {
      await this.sql.execute(
        `INSERT INTO cloud_workspace_regions
         (workspace_id, owner_id, primary_region_id, secondary_region_id, read_preference, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          workspaceId,
          ownerId,
          input.primaryRegionId,
          input.secondaryRegionId ?? null,
          readPreference,
          updatedAt,
        ],
      );
    }

    const assignment = await this.getWorkspaceAssignment(workspaceId);
    if (!assignment) {
      throw new Error('Failed to persist workspace region assignment');
    }
    return assignment;
  }

  async getWorkspaceAssignment(workspaceId: string): Promise<WorkspaceRegionAssignment | null> {
    const rows = await this.sql.query<AssignmentRow>(
      `SELECT workspace_id, owner_id, primary_region_id, secondary_region_id, read_preference, updated_at
       FROM cloud_workspace_regions WHERE workspace_id = ?`,
      [workspaceId],
    );
    return rows[0] ? mapAssignment(rows[0]) : null;
  }
}

/** In-memory region registry for unit tests. */
export class InMemoryRegionRegistry implements IRegionRegistry {
  private readonly regions = new Map<string, CloudRegion>();
  private readonly assignments = new Map<string, WorkspaceRegionAssignment>();

  async ensureDefaultRegion(code: string, displayName: string): Promise<CloudRegion> {
    const existing = await this.getRegionByCode(code);
    if (existing) return existing;
    return this.registerRegion({ code, displayName });
  }

  async registerRegion(input: {
    code: string;
    displayName: string;
    cloudProvider?: string;
  }): Promise<CloudRegion> {
    const region: CloudRegion = {
      id: randomUUID(),
      code: input.code,
      displayName: input.displayName,
      cloudProvider: input.cloudProvider,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.regions.set(region.id, region);
    return region;
  }

  async getRegionById(id: string): Promise<CloudRegion | null> {
    return this.regions.get(id) ?? null;
  }

  async getRegionByCode(code: string): Promise<CloudRegion | null> {
    for (const region of this.regions.values()) {
      if (region.code === code) return region;
    }
    return null;
  }

  async listRegions(): Promise<CloudRegion[]> {
    return [...this.regions.values()];
  }

  async assignWorkspaceRegion(
    workspaceId: string,
    ownerId: string,
    input: AssignRegionInput,
  ): Promise<WorkspaceRegionAssignment> {
    const assignment: WorkspaceRegionAssignment = {
      workspaceId,
      ownerId,
      primaryRegionId: input.primaryRegionId,
      secondaryRegionId: input.secondaryRegionId,
      readPreference: input.readPreference ?? 'primary',
      updatedAt: new Date().toISOString(),
    };
    this.assignments.set(workspaceId, assignment);
    return assignment;
  }

  async getWorkspaceAssignment(workspaceId: string): Promise<WorkspaceRegionAssignment | null> {
    return this.assignments.get(workspaceId) ?? null;
  }
}
