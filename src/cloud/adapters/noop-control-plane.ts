import { NotFoundError } from '../../types/errors.js';
import type { IControlPlane, RotateApiKeyResult } from '../ports/icontrol-plane.port.js';
import type { AssignRegionInput, WorkspaceRegionAssignment } from '../types/region.types.js';
import type {
  ProvisionWorkspaceInput,
  TenantMetadataRecord,
  TenantTopology,
} from '../types/tenant.types.js';

/** No-op control plane when CONTROL_PLANE_ENABLED=false. */
export class NoOpControlPlane implements IControlPlane {
  async provisionWorkspace(_input: ProvisionWorkspaceInput): Promise<TenantMetadataRecord> {
    throw new NotFoundError('ControlPlane', 'disabled');
  }

  async deprovisionWorkspace(_organizationId: string, _workspaceId: string): Promise<TenantMetadataRecord> {
    throw new NotFoundError('ControlPlane', 'disabled');
  }

  async assignRegion(
    _organizationId: string,
    _workspaceId: string,
    _input: AssignRegionInput,
  ): Promise<WorkspaceRegionAssignment> {
    throw new NotFoundError('ControlPlane', 'disabled');
  }

  async rotateApiKey(_identityId: string, _actorOwnerId: string): Promise<RotateApiKeyResult> {
    throw new NotFoundError('ControlPlane', 'disabled');
  }

  async getTenantTopology(_organizationId: string, _workspaceId: string): Promise<TenantTopology> {
    throw new NotFoundError('ControlPlane', 'disabled');
  }

  async listRegions() {
    return [];
  }
}
