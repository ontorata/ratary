/** External infra hook surface — K8s operator, Terraform output consumer (ADR-033). */
export interface ProvisionInfraInput {
  organizationId: string;
  workspaceId: string;
  regionCode: string;
  metadata?: Record<string, unknown>;
}

export interface ProvisionInfraResult {
  accepted: boolean;
  externalRef?: string;
  message?: string;
}

export interface ICloudProvisioner {
  provision(input: ProvisionInfraInput): Promise<ProvisionInfraResult>;
  deprovision(input: {
    organizationId: string;
    workspaceId: string;
    externalRef?: string;
  }): Promise<ProvisionInfraResult>;
}
