import { describe, it, expect } from 'vitest';
import type { FastifyRequest } from 'fastify';
import { NotFoundError, ValidationError } from '../../src/types/errors.js';
import {
  buildTransportContextFromGrpcMetadata,
  buildTransportContextFromMcpEnv,
  buildTransportContextFromRestRequest,
  resolveMemoryScopeFromTransportContext,
  toTransportError,
  fromAppError,
} from '../../src/transport/shared/index.js';
import type { AuthUser } from '../../src/auth/auth.types.js';
import type { IScopeResolver } from '../../src/scope/iscope-resolver.interface.js';

const authUser: AuthUser = {
  ownerId: 'owner-1',
  identityId: 'identity-1',
  identityType: 'api_key',
  clientId: null,
  permissions: ['memory.read', 'memory.write'],
};

function fakeRequest(overrides: {
  id?: string;
  user?: AuthUser;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}): FastifyRequest {
  return {
    id: overrides.id ?? 'req-1',
    user: overrides.user,
    headers: overrides.headers ?? {},
    query: overrides.query ?? {},
  } as FastifyRequest;
}

describe('transport shared — TransportContext', () => {
  it('should build REST transport context from Fastify request', () => {
    const ctx = buildTransportContextFromRestRequest(
      fakeRequest({
        user: authUser,
        headers: {
          'x-workspace-id': ' ws-1 ',
          'x-agent-id': 'agent-a',
          'x-organization-id': 'org-1',
        },
        query: { projectId: 'ai-brain' },
      }),
    );

    expect(ctx).toMatchObject({
      requestId: 'req-1',
      ownerId: 'owner-1',
      workspaceId: 'ws-1',
      agentId: 'agent-a',
      organizationId: 'org-1',
      projectId: 'ai-brain',
      auth: authUser,
      source: 'rest',
    });
  });

  it('should build MCP transport context from env', () => {
    const ctx = buildTransportContextFromMcpEnv({
      ownerId: 'owner-mcp',
      workspaceId: 'ws-mcp',
      agentId: 'agent-mcp',
    });

    expect(ctx.ownerId).toBe('owner-mcp');
    expect(ctx.workspaceId).toBe('ws-mcp');
    expect(ctx.agentId).toBe('agent-mcp');
    expect(ctx.source).toBe('mcp-stdio');
    expect(ctx.auth).toBeNull();
    expect(ctx.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should build gRPC transport context from metadata', () => {
    const ctx = buildTransportContextFromGrpcMetadata({
      requestId: 'grpc-req-1',
      ownerId: 'owner-grpc',
      workspaceId: 'ws-grpc',
    });

    expect(ctx).toMatchObject({
      requestId: 'grpc-req-1',
      ownerId: 'owner-grpc',
      workspaceId: 'ws-grpc',
      source: 'grpc',
    });
  });
});

describe('transport shared — scope resolution', () => {
  it('should resolve MCP scope via scope resolver', async () => {
    const resolver: IScopeResolver = {
      resolveFromRequest: async () => ({ ownerId: 'x' }),
      resolveFromMcp: async (env) => ({
        ownerId: env.ownerId,
        workspaceId: env.workspaceId,
      }),
    };

    const scope = await resolveMemoryScopeFromTransportContext(
      buildTransportContextFromMcpEnv({ ownerId: 'owner-mcp', workspaceId: 'ws-1' }),
      resolver,
    );

    expect(scope).toEqual({ ownerId: 'owner-mcp', workspaceId: 'ws-1' });
  });

  it('should return owner-only scope when REST context has no auth user', async () => {
    const resolver: IScopeResolver = {
      resolveFromRequest: async () => {
        throw new Error('should not be called');
      },
      resolveFromMcp: async () => ({ ownerId: 'x' }),
    };

    const scope = await resolveMemoryScopeFromTransportContext(
      buildTransportContextFromRestRequest(fakeRequest({})),
      resolver,
    );

    expect(scope).toEqual({ ownerId: '' });
  });
});

describe('transport shared — transport errors', () => {
  it('should map AppError to transport payload', () => {
    const payload = fromAppError(new NotFoundError('Memory', 'abc'));
    expect(payload).toEqual({
      code: 'NOT_FOUND',
      message: "Memory with id 'abc' not found",
      statusCode: 404,
    });
  });

  it('should include validation details when present', () => {
    const payload = fromAppError(new ValidationError('bad input', { field: 'title' }));
    expect(payload.details).toEqual({ field: 'title' });
  });

  it('should map unknown errors to internal transport payload', () => {
    expect(toTransportError('boom')).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
  });
});
