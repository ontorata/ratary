import type {
  ICloudProvisioner,
  ProvisionInfraInput,
  ProvisionInfraResult,
} from '../ports/icloud-provisioner.port.js';

/** Default external provisioner — accepts requests without external side effects. */
export class NoOpCloudProvisioner implements ICloudProvisioner {
  async provision(_input: ProvisionInfraInput): Promise<ProvisionInfraResult> {
    return { accepted: false, message: 'External provisioner not configured' };
  }

  async deprovision(_input: {
    organizationId: string;
    workspaceId: string;
    externalRef?: string;
  }): Promise<ProvisionInfraResult> {
    return { accepted: false, message: 'External provisioner not configured' };
  }
}
