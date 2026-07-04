import type { AgentClientProfile } from '../types/agent-client-profile.js';
import type { AgentClientType, DeploymentProtocolFlags } from '../types/agent-client-type.js';

export interface IAgentClientCatalog {
  listProfiles(): Promise<AgentClientProfile[]>;
  getProfile(clientType: AgentClientType): Promise<AgentClientProfile | null>;
  listCompatibleProfiles(deployment: DeploymentProtocolFlags): Promise<AgentClientProfile[]>;
  /** Sync variant for manifest builders that must not await. */
  listCompatibleProfilesSync(deployment?: DeploymentProtocolFlags): AgentClientProfile[];
}
