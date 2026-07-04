import type { AgentClientProfile } from './agent-client-profile.js';

export interface AgentEcosystemManifest {
  memoryCloud: {
    deploymentId: string;
    sharedModel: 'workspace-scoped';
    federationEnabled: boolean;
  };
  clients: AgentClientProfile[];
  agentIdentity: {
    registrationRequired: boolean;
    mcpTools: string[];
    scopeEnvVars: string[];
  };
  recommendedFlow: {
    discover: string;
    registerAgent: string;
    handoff: string;
    context: string;
  };
  externalRuntimes: {
    note: string;
    sdkPackage: string;
    sdkLocation: 'external';
  };
}
