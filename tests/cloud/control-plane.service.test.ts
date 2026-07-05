import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { InMemoryRegionRegistry } from '../../src/infrastructure/cloud/sql-region-registry.js';
import { ControlPlaneService } from '../../src/cloud/services/control-plane.service.js';
import { ManualCloudProvisioner } from '../../src/cloud/adapters/manual-cloud-provisioner.js';
import type { ITenantMetadataStore } from '../../src/cloud/ports/itenant-metadata-store.port.js';
import type {
  ProvisionWorkspaceInput,
  TenantMetadataRecord,
  TenantMetadataStatus,
} from '../../src/cloud/types/tenant.types.js';

class InMemoryTenantMetadataStore implements ITenantMetadataStore {
  private readonly records = new Map<string, TenantMetadataRecord>();

  private key(orgId: string, workspaceId: string): string {
    return `${orgId}:${workspaceId}`;
  }

  async upsert(
    input: ProvisionWorkspaceInput & { primaryRegionId: string },
  ): Promise<TenantMetadataRecord> {
    const now = new Date().toISOString();
    const existing = await this.findByWorkspace(input.organizationId, input.workspaceId);
    if (existing) {
      const updated: TenantMetadataRecord = {
        ...existing,
        ...input,
        status: 'active',
        updatedAt: now,
      };
      this.records.set(this.key(input.organizationId, input.workspaceId), updated);
      return updated;
    }
    const record: TenantMetadataRecord = {
      id: randomUUID(),
      organizationId: input.organizationId,
      workspaceId: input.workspaceId,
      ownerId: input.ownerId,
      departmentId: input.departmentId,
      tenantProjectId: input.tenantProjectId,
      primaryRegionId: input.primaryRegionId,
      secondaryRegionId: input.secondaryRegionId,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.records.set(this.key(input.organizationId, input.workspaceId), record);
    return record;
  }

  async findByWorkspace(
    organizationId: string,
    workspaceId: string,
  ): Promise<TenantMetadataRecord | null> {
    return this.records.get(this.key(organizationId, workspaceId)) ?? null;
  }

  async updateStatus(
    organizationId: string,
    workspaceId: string,
    status: TenantMetadataStatus,
  ): Promise<TenantMetadataRecord> {
    const record = await this.findByWorkspace(organizationId, workspaceId);
    if (!record) throw new Error('not found');
    const updated = { ...record, status, updatedAt: new Date().toISOString() };
    this.records.set(this.key(organizationId, workspaceId), updated);
    return updated;
  }

  async updateRegions(
    organizationId: string,
    workspaceId: string,
    primaryRegionId: string,
    secondaryRegionId?: string,
  ): Promise<TenantMetadataRecord> {
    const record = await this.findByWorkspace(organizationId, workspaceId);
    if (!record) throw new Error('not found');
    const updated = {
      ...record,
      primaryRegionId,
      secondaryRegionId,
      updatedAt: new Date().toISOString(),
    };
    this.records.set(this.key(organizationId, workspaceId), updated);
    return updated;
  }

  async listByOrganization(organizationId: string): Promise<TenantMetadataRecord[]> {
    return [...this.records.values()].filter((r) => r.organizationId === organizationId);
  }
}

describe('ControlPlaneService', () => {
  it('provisions workspace with default region and returns topology', async () => {
    const regionRegistry = new InMemoryRegionRegistry();
    const tenantStore = new InMemoryTenantMetadataStore();
    const service = new ControlPlaneService(
      tenantStore,
      regionRegistry,
      null,
      new ManualCloudProvisioner(),
      {
        defaultRegionCode: 'local',
        federationEnabled: false,
        localNodeId: 'node-1',
        federationPeers: [],
      },
    );

    const orgId = randomUUID();
    const workspaceId = randomUUID();
    const ownerId = randomUUID();

    const record = await service.provisionWorkspace({
      organizationId: orgId,
      workspaceId,
      ownerId,
    });

    expect(record.status).toBe('active');
    expect(record.primaryRegionId).toBeTruthy();

    const topology = await service.getTenantTopology(orgId, workspaceId);
    expect(topology.primaryRegion.code).toBe('local');
    expect(topology.ownerId).toBe(ownerId);
    expect(topology.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('deprovisions workspace metadata', async () => {
    const regionRegistry = new InMemoryRegionRegistry();
    const tenantStore = new InMemoryTenantMetadataStore();
    const service = new ControlPlaneService(
      tenantStore,
      regionRegistry,
      null,
      new ManualCloudProvisioner(),
      {
        defaultRegionCode: 'local',
        federationEnabled: false,
        localNodeId: 'node-1',
        federationPeers: [],
      },
    );

    const orgId = randomUUID();
    const workspaceId = randomUUID();
    await service.provisionWorkspace({
      organizationId: orgId,
      workspaceId,
      ownerId: randomUUID(),
    });

    const deprovisioned = await service.deprovisionWorkspace(orgId, workspaceId);
    expect(deprovisioned.status).toBe('deprovisioned');
  });
});
