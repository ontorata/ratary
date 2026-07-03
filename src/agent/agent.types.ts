/** Agent registry types — ADR-007 Appendix A. */

export const AGENT_TYPES = ['mcp', 'rest', 'bot', 'service'] as const;

export type AgentType = (typeof AGENT_TYPES)[number];

export interface AgentDescriptor {
  name: string;
  agentType?: AgentType;
  clientId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AgentRecord {
  id: string;
  workspaceId: string;
  ownerId: string;
  name: string;
  clientId: string | null;
  agentType: AgentType;
  metadata: Record<string, unknown>;
  createdAt: string;
  active: boolean;
}

export interface WorkspaceRecord {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  createdAt: string;
}
