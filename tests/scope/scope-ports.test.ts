import { describe, it, expect } from 'vitest';
import type { IScopeResolver } from '../../src/scope/iscope-resolver.interface.js';
import type { IAgentIdentity } from '../../src/agent/iagent-identity.interface.js';
import type { ISyncManager } from '../../src/sync/isync-manager.interface.js';
import type { AuthUser } from '../../src/auth/auth.types.js';
import type { MemoryScope } from '../../src/types/memory-scope.js';
import type { AgentDescriptor, AgentRecord } from '../../src/agent/agent.types.js';
import type { MemoryWriteEvent } from '../../src/sync/isync-manager.interface.js';

describe('Phase 9 port contracts', () => {
  it('should satisfy IScopeResolver shape', async () => {
    const resolver: IScopeResolver = {
      async resolveFromRequest(auth: AuthUser, hints) {
        return {
          ownerId: auth.ownerId,
          workspaceId: hints?.workspaceId,
          agentId: hints?.agentId,
        };
      },
      resolveFromMcp(env) {
        return Promise.resolve({
          ownerId: env.ownerId,
          workspaceId: env.workspaceId,
          agentId: env.agentId,
        });
      },
    };

    const auth: AuthUser = {
      ownerId: 'owner-1',
      identityId: 'id-1',
      identityType: 'api_key',
      clientId: null,
      permissions: ['memory.read'],
    };

    const scope = await resolver.resolveFromRequest(auth, { workspaceId: 'ws-1' });
    expect(scope.workspaceId).toBe('ws-1');
  });

  it('should satisfy IAgentIdentity shape', async () => {
    const agent: AgentRecord = {
      id: 'agent-1',
      workspaceId: 'ws-1',
      ownerId: 'owner-1',
      name: 'Cursor',
      clientId: null,
      agentType: 'mcp',
      metadata: {},
      createdAt: '2026-01-01T00:00:00.000Z',
      active: true,
    };

    const registry: IAgentIdentity = {
      async register(_scope: MemoryScope, _descriptor: AgentDescriptor) {
        return agent;
      },
      async resolve(_scope: MemoryScope, agentId: string) {
        return agentId === agent.id ? agent : null;
      },
      async listByWorkspace() {
        return [agent];
      },
    };

    const result = await registry.resolve({ ownerId: 'owner-1', workspaceId: 'ws-1' }, 'agent-1');
    expect(result?.name).toBe('Cursor');
  });

  it('should satisfy ISyncManager shape', async () => {
    const sync: ISyncManager = {
      async reconcileWrite(_event: MemoryWriteEvent) {
        return 'accept';
      },
    };

    const result = await sync.reconcileWrite({
      scope: { ownerId: 'owner-1', workspaceId: 'ws-1', agentId: 'agent-1' },
      memoryId: 'mem-1',
      operation: 'update',
      expectedUpdatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(result).toBe('accept');
  });
});
