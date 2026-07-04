import type { AgentClientProtocol, AgentClientType } from './agent-client-type.js';

export interface AgentClientProfile {
  readonly clientType: AgentClientType;
  readonly displayName: string;
  readonly vendor: string;
  readonly primaryProtocol: 'mcp-stdio' | 'rest' | 'grpc';
  readonly supportedProtocols: AgentClientProtocol[];
  readonly mcp?: {
    configPaths: string[];
    requiredEnv: string[];
    setupCommand?: string;
  };
  readonly rest?: {
    authMethods: Array<'api-key' | 'jwt' | 'oauth'>;
    recommendedEndpoints: string[];
  };
  readonly grpc?: {
    required: boolean;
    services: string[];
  };
  readonly workspace: {
    required: boolean;
    registrationTool?: string;
  };
  readonly handoff: {
    supportsMcpSaveMemory: boolean;
    recommendedTags: string[];
  };
  readonly documentationUrl?: string;
}
