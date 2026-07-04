import type { Env } from '../../config/env.js';
import type { IAgentClientCatalog } from '../ports/iagent-client-catalog.port.js';
import type { AgentClientProfile } from '../types/agent-client-profile.js';
import type { AgentClientProtocol, AgentClientType, DeploymentProtocolFlags } from '../types/agent-client-type.js';
import { AGENT_CLIENT_PROFILES } from './agent-client-registry.js';

function deploymentFlagsFromEnv(env: Env): DeploymentProtocolFlags {
  return {
    mcpStdio: true,
    rest: true,
    grpc: env.GRPC_ENABLED,
    websocket: env.WEBSOCKET_ENABLED,
    sse: env.SSE_ENABLED,
    remoteMcp: env.REMOTE_MCP_ENABLED,
    federation: env.FEDERATION_ENABLED,
  };
}

function protocolEnabled(flags: DeploymentProtocolFlags, protocol: AgentClientProtocol): boolean {
  switch (protocol) {
    case 'mcp-stdio':
      return flags.mcpStdio;
    case 'rest':
      return flags.rest;
    case 'grpc':
      return flags.grpc;
    case 'websocket':
      return flags.websocket;
    case 'sse':
      return flags.sse;
    default:
      return false;
  }
}

function filterProfileProtocols(
  profile: AgentClientProfile,
  flags: DeploymentProtocolFlags,
): AgentClientProfile {
  const supportedProtocols = profile.supportedProtocols.filter((p) => protocolEnabled(flags, p));
  return { ...profile, supportedProtocols };
}

export class DefaultAgentClientCatalog implements IAgentClientCatalog {
  constructor(private readonly env: Env) {}

  async listProfiles(): Promise<AgentClientProfile[]> {
    return [...AGENT_CLIENT_PROFILES];
  }

  async getProfile(clientType: AgentClientType): Promise<AgentClientProfile | null> {
    return AGENT_CLIENT_PROFILES.find((p) => p.clientType === clientType) ?? null;
  }

  listCompatibleProfilesSync(deployment?: DeploymentProtocolFlags): AgentClientProfile[] {
    const flags = deployment ?? deploymentFlagsFromEnv(this.env);
    return AGENT_CLIENT_PROFILES.map((profile) => filterProfileProtocols(profile, flags)).filter(
      (profile) => profile.supportedProtocols.length > 0,
    );
  }

  async listCompatibleProfiles(deployment?: DeploymentProtocolFlags): Promise<AgentClientProfile[]> {
    return this.listCompatibleProfilesSync(deployment);
  }
}

export function deploymentProtocolFlagsFromEnv(env: Env): DeploymentProtocolFlags {
  return deploymentFlagsFromEnv(env);
}
