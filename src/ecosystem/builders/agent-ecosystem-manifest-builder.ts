import type { Env } from '../../config/env.js';
import type { IAgentClientCatalog } from '../ports/iagent-client-catalog.port.js';
import type { AgentEcosystemManifest } from '../types/agent-ecosystem-manifest.types.js';
import {
  DefaultAgentClientCatalog,
  deploymentProtocolFlagsFromEnv,
} from '../catalog/default-agent-client-catalog.js';

export class AgentEcosystemManifestBuilder {
  private readonly catalog: IAgentClientCatalog;

  constructor(private readonly env: Env, catalog?: IAgentClientCatalog) {
    this.catalog = catalog ?? new DefaultAgentClientCatalog(env);
  }

  buildSync(deploymentId?: string): AgentEcosystemManifest {
    const flags = deploymentProtocolFlagsFromEnv(this.env);
    const clients = this.catalog.listCompatibleProfilesSync(flags);

    return {
      memoryCloud: {
        deploymentId: deploymentId ?? this.env.FEDERATION_NODE_ID,
        sharedModel: 'workspace-scoped',
        federationEnabled: this.env.FEDERATION_ENABLED,
      },
      clients,
      agentIdentity: {
        registrationRequired: false,
        mcpTools: ['register_agent', 'list_agents'],
        scopeEnvVars: ['MCP_OWNER_ID', 'MCP_WORKSPACE_ID', 'MCP_AGENT_ID'],
      },
      recommendedFlow: {
        discover: 'GET /api/v1/capabilities',
        registerAgent: 'register_agent | POST /api/v1/workspaces/agents',
        handoff: 'save_memory with tags handoff',
        context: 'build_context | POST /api/v1/context',
      },
      externalRuntimes: {
        note: 'Agent loops live outside this repository',
        sdkPackage: '@ai-brain/client',
        sdkLocation: 'external',
      },
    };
  }

  async build(deploymentId?: string): Promise<AgentEcosystemManifest> {
    return this.buildSync(deploymentId);
  }
}
