/** SSOT client types — maps to external agent runtimes (ADR-030 Phase 15). */
export const AGENT_CLIENT_TYPES = [
  'cursor',
  'claude-code',
  'claude-desktop',
  'openai-api',
  'openai-agents-sdk',
  'gemini-cli',
  'codex',
  'continue',
  'qwen-code',
  'vscode-copilot',
  'custom-rest',
  'custom-mcp',
] as const;

export type AgentClientType = (typeof AGENT_CLIENT_TYPES)[number];

export type AgentClientProtocol = 'mcp-stdio' | 'rest' | 'grpc' | 'websocket' | 'sse';

export interface DeploymentProtocolFlags {
  mcpStdio: boolean;
  rest: boolean;
  grpc: boolean;
  websocket: boolean;
  sse: boolean;
  remoteMcp: boolean;
  federation: boolean;
}
