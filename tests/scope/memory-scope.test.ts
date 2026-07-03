import { describe, it, expect } from 'vitest';
import {
  hasWorkspaceScope,
  getMcpMemoryScope,
  type MemoryScope,
} from '../../src/types/memory-scope.js';

describe('MemoryScope (ADR-007)', () => {
  it('should allow owner-only scope for backward compatibility', () => {
    const scope: MemoryScope = { ownerId: 'owner-1' };
    expect(scope.ownerId).toBe('owner-1');
    expect(hasWorkspaceScope(scope)).toBe(false);
  });

  it('should support optional workspaceId and agentId', () => {
    const scope: MemoryScope = {
      ownerId: 'owner-1',
      workspaceId: 'ws-1',
      agentId: 'agent-1',
      projectId: 'proj-a',
    };

    expect(hasWorkspaceScope(scope)).toBe(true);
    expect(scope.agentId).toBe('agent-1');
  });

  it('should treat empty workspaceId as not workspace-scoped', () => {
    expect(hasWorkspaceScope({ ownerId: 'o', workspaceId: '' })).toBe(false);
  });
});

describe('getMcpMemoryScope', () => {
  it('should include optional MCP_WORKSPACE_ID and MCP_AGENT_ID when set', () => {
    const originalOwner = process.env.MCP_OWNER_ID;
    const originalWorkspace = process.env.MCP_WORKSPACE_ID;
    const originalAgent = process.env.MCP_AGENT_ID;

    process.env.MCP_OWNER_ID = 'mcp-owner';
    process.env.MCP_WORKSPACE_ID = 'ws-default';
    process.env.MCP_AGENT_ID = 'agent-cursor';

    const scope = getMcpMemoryScope();

    expect(scope).toEqual({
      ownerId: 'mcp-owner',
      workspaceId: 'ws-default',
      agentId: 'agent-cursor',
    });

    if (originalOwner === undefined) delete process.env.MCP_OWNER_ID;
    else process.env.MCP_OWNER_ID = originalOwner;
    if (originalWorkspace === undefined) delete process.env.MCP_WORKSPACE_ID;
    else process.env.MCP_WORKSPACE_ID = originalWorkspace;
    if (originalAgent === undefined) delete process.env.MCP_AGENT_ID;
    else process.env.MCP_AGENT_ID = originalAgent;
  });
});
