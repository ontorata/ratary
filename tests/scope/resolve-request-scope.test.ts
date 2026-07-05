import { describe, it, expect } from 'vitest';
import type { FastifyRequest } from 'fastify';
import type { AuthUser } from '../../src/auth/auth.types.js';
import type { IScopeResolver } from '../../src/scope/iscope-resolver.interface.js';
import type { MemoryScope } from '../../src/types/memory-scope.js';
import {
  extractScopeHintsFromRequest,
  resolveMemoryScopeFromRequest,
} from '../../src/scope/resolve-request-scope.js';

const authUser: AuthUser = {
  ownerId: 'owner-1',
  identityId: 'identity-1',
  identityType: 'api_key',
  clientId: null,
  permissions: ['memory.read', 'memory.write'],
};

function fakeRequest(overrides: {
  user?: AuthUser;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}): FastifyRequest {
  return {
    user: overrides.user,
    headers: overrides.headers ?? {},
    query: overrides.query ?? {},
  } as FastifyRequest;
}

describe('resolve-request-scope', () => {
  it('should extract workspace and agent hints from headers', () => {
    const hints = extractScopeHintsFromRequest(
      fakeRequest({
        headers: {
          'x-workspace-id': ' ws-1 ',
          'x-agent-id': 'agent-a',
        },
        query: { projectId: 'ai-brain' },
      }),
    );

    expect(hints).toEqual({
      workspaceId: 'ws-1',
      agentId: 'agent-a',
      projectId: 'ai-brain',
    });
  });

  it('should return owner-only scope when request has no authenticated user', async () => {
    const resolver: IScopeResolver = {
      resolveFromRequest: async () => {
        throw new Error('should not be called');
      },
      resolveFromMcp: async () => ({ ownerId: 'x' }),
    };

    const scope = await resolveMemoryScopeFromRequest(fakeRequest({}), resolver);
    expect(scope).toEqual({ ownerId: '' });
  });

  it('should delegate to scope resolver when user is present', async () => {
    const resolved: MemoryScope = {
      ownerId: 'owner-1',
      workspaceId: 'ws-default',
      agentId: 'agent-1',
    };

    const resolver: IScopeResolver = {
      resolveFromRequest: async (auth, hints) => {
        expect(auth).toBe(authUser);
        expect(hints?.workspaceId).toBe('ws-1');
        return resolved;
      },
      resolveFromMcp: async () => ({ ownerId: 'x' }),
    };

    const scope = await resolveMemoryScopeFromRequest(
      fakeRequest({
        user: authUser,
        headers: { 'x-workspace-id': 'ws-1' },
      }),
      resolver,
    );

    expect(scope).toEqual(resolved);
  });
});
