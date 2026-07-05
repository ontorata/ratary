import type { IdentityService } from '../../auth/identity.service.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../types/errors.js';
import type { FederationNodeDescriptor } from '../../federation/types/federation-node.descriptor.js';
import type { ICloudProvisioner } from '../ports/icloud-provisioner.port.js';
import type { IControlPlane, RotateApiKeyResult } from '../ports/icontrol-plane.port.js';
import type { IRegionRegistry } from '../ports/iregion-registry.port.js';
import type { ITenantMetadataStore } from '../ports/itenant-metadata-store.port.js';
import type { AssignRegionInput, WorkspaceRegionAssignment } from '../types/region.types.js';
import type {
  ProvisionWorkspaceInput,
  TenantMetadataRecord,
  TenantTopology,
} from '../types/tenant.types.js';

export interface ControlPlaneServiceOptions {
  defaultRegionCode: string;
  federationEnabled: boolean;
  localNodeId: string;
  federationPeers: FederationNodeDescriptor[];
}

/** Manual control plane — metadata orchestration only (ADR-033). */
export class ControlPlaneService implements IControlPlane {
  constructor(
    private readonly tenantStore: ITenantMetadataStore,
    private readonly regionRegistry: IRegionRegistry,
    private readonly identityService: IdentityService | null,
    private readonly cloudProvisioner: ICloudProvisioner,
    private readonly options: ControlPlaneServiceOptions,
  ) {}

  async provisionWorkspace(input: ProvisionWorkspaceInput): Promise<TenantMetadataRecord> {
    if (!input.organizationId?.trim() || !input.workspaceId?.trim() || !input.ownerId?.trim()) {
      throw new ValidationError('organizationId, workspaceId, and ownerId are required');
    }

    const regionCode = input.primaryRegionId
      ? (await this.regionRegistry.getRegionById(input.primaryRegionId))?.code ??
        input.primaryRegionId
      : this.options.defaultRegionCode;

    const primaryRegion = input.primaryRegionId
      ? await this.regionRegistry.getRegionById(input.primaryRegionId)
      : await this.regionRegistry.ensureDefaultRegion(
          this.options.defaultRegionCode,
          'Local',
        );

    if (!primaryRegion) {
      throw new ValidationError('Primary region not found');
    }

    let secondaryRegionId = input.secondaryRegionId;
    if (input.secondaryRegionId) {
      const secondary = await this.regionRegistry.getRegionById(input.secondaryRegionId);
      if (!secondary) throw new ValidationError('Secondary region not found');
      secondaryRegionId = secondary.id;
    }

    const record = await this.tenantStore.upsert({
      ...input,
      primaryRegionId: primaryRegion.id,
      secondaryRegionId,
    });

    await this.regionRegistry.assignWorkspaceRegion(input.workspaceId, input.ownerId, {
      primaryRegionId: primaryRegion.id,
      secondaryRegionId,
      readPreference: 'primary',
    });

    await this.cloudProvisioner.provision({
      organizationId: input.organizationId,
      workspaceId: input.workspaceId,
      regionCode,
    });

    return record;
  }

  async deprovisionWorkspace(
    organizationId: string,
    workspaceId: string,
  ): Promise<TenantMetadataRecord> {
    const existing = await this.tenantStore.findByWorkspace(organizationId, workspaceId);
    if (!existing) throw new NotFoundError('TenantMetadata', workspaceId);

    await this.cloudProvisioner.deprovision({ organizationId, workspaceId });
    return this.tenantStore.updateStatus(organizationId, workspaceId, 'deprovisioned');
  }

  async assignRegion(
    organizationId: string,
    workspaceId: string,
    input: AssignRegionInput,
  ): Promise<WorkspaceRegionAssignment> {
    const tenant = await this.tenantStore.findByWorkspace(organizationId, workspaceId);
    if (!tenant) throw new NotFoundError('TenantMetadata', workspaceId);

    const primary = await this.regionRegistry.getRegionById(input.primaryRegionId);
    if (!primary) throw new ValidationError('Primary region not found');

    if (input.secondaryRegionId) {
      const secondary = await this.regionRegistry.getRegionById(input.secondaryRegionId);
      if (!secondary) throw new ValidationError('Secondary region not found');
    }

    await this.tenantStore.updateRegions(
      organizationId,
      workspaceId,
      input.primaryRegionId,
      input.secondaryRegionId,
    );

    return this.regionRegistry.assignWorkspaceRegion(workspaceId, tenant.ownerId, input);
  }

  async rotateApiKey(identityId: string, actorOwnerId: string): Promise<RotateApiKeyResult> {
    if (!this.identityService) {
      throw new ForbiddenError('Identity service not available for API key rotation');
    }
    const result = await this.identityService.rotate(identityId, actorOwnerId);
    return {
      identityId,
      apiKey: result.apiKey,
      oauthToken: result.oauthToken,
    };
  }

  async getTenantTopology(organizationId: string, workspaceId: string): Promise<TenantTopology> {
    const tenant = await this.tenantStore.findByWorkspace(organizationId, workspaceId);
    if (!tenant) throw new NotFoundError('TenantMetadata', workspaceId);

    const primary = await this.regionRegistry.getRegionById(tenant.primaryRegionId);
    if (!primary) throw new NotFoundError('Region', tenant.primaryRegionId);

    const secondary = tenant.secondaryRegionId
      ? await this.regionRegistry.getRegionById(tenant.secondaryRegionId)
      : null;

    const assignment = await this.regionRegistry.getWorkspaceAssignment(workspaceId);

    const topology: TenantTopology = {
      organizationId,
      workspaceId,
      ownerId: tenant.ownerId,
      generatedAt: new Date().toISOString(),
      status: tenant.status,
      primaryRegion: {
        id: primary.id,
        code: primary.code,
        displayName: primary.displayName,
      },
      readPreference: assignment?.readPreference ?? 'primary',
      ...(secondary
        ? {
            secondaryRegion: {
              id: secondary.id,
              code: secondary.code,
              displayName: secondary.displayName,
            },
          }
        : {}),
    };

    if (this.options.federationEnabled) {
      topology.federation = buildFederationTopology(
        this.options.localNodeId,
        this.options.federationPeers,
        primary.code,
        secondary?.code,
      );
    }

    return topology;
  }

  async listRegions() {
    return this.regionRegistry.listRegions();
  }
}

function buildFederationTopology(
  localNodeId: string,
  peers: FederationNodeDescriptor[],
  primaryCode: string,
  secondaryCode?: string,
): TenantTopology['federation'] {
  const mapPeer = (p: FederationNodeDescriptor) => ({
    nodeId: p.nodeId,
    region: p.region,
    displayName: p.displayName,
  });

  return {
    localNodeId,
    peersInPrimaryRegion: peers.filter((p) => p.region === primaryCode).map(mapPeer),
    peersInSecondaryRegion: secondaryCode
      ? peers.filter((p) => p.region === secondaryCode).map(mapPeer)
      : [],
  };
}
