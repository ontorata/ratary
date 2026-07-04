import type {
  ICloudProvisioner,
  ProvisionInfraInput,
  ProvisionInfraResult,
} from '../ports/icloud-provisioner.port.js';

/** Manual provisioner — records intent without external orchestration. */
export class ManualCloudProvisioner implements ICloudProvisioner {
  async provision(input: ProvisionInfraInput): Promise<ProvisionInfraResult> {
    return {
      accepted: true,
      externalRef: `manual:${input.organizationId}:${input.workspaceId}`,
      message: 'Manual provisioning recorded — no external orchestrator configured',
    };
  }

  async deprovision(input: {
    organizationId: string;
    workspaceId: string;
    externalRef?: string;
  }): Promise<ProvisionInfraResult> {
    return {
      accepted: true,
      externalRef: input.externalRef ?? `manual:${input.organizationId}:${input.workspaceId}`,
      message: 'Manual deprovisioning recorded',
    };
  }
}
