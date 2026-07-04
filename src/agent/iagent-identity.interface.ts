import type { MemoryScope } from '../types/memory-scope.js';
import type { AgentDescriptor, AgentRecord } from './agent.types.js';

/**
 * Agent identity registry within a workspace.
 * @see .ai/adr/007-multi-ai-workspace-scope.md
 */
export interface IAgentIdentity {
  register(scope: MemoryScope, descriptor: AgentDescriptor): Promise<AgentRecord>;

  resolve(scope: MemoryScope, agentId: string): Promise<AgentRecord | null>;

  listByWorkspace(scope: MemoryScope): Promise<AgentRecord[]>;
}
