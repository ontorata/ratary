import { describe, it, expect } from 'vitest';
import { buildContextAuditFields } from '../../src/transport/shared/context-audit-fields.js';
import type { TransportContext } from '../../src/transport/shared/transport-context.types.js';

describe('buildContextAuditFields (D12-01)', () => {
  it('maps REST auth identity and client IP', () => {
    const ctx: TransportContext = {
      requestId: 'req-1',
      ownerId: 'owner-1',
      auth: {
        ownerId: 'owner-1',
        identityId: 'identity-abc',
        clientId: 'client-1',
      },
      source: 'rest',
      clientIp: '203.0.113.10',
    };

    expect(buildContextAuditFields(ctx)).toEqual({
      auditIdentityId: 'identity-abc',
      auditIpAddress: '203.0.113.10',
    });
  });

  it('maps gRPC metadata identity and client IP without auth user', () => {
    const ctx: TransportContext = {
      requestId: 'req-grpc',
      ownerId: 'owner-1',
      auth: null,
      source: 'grpc',
      clientIp: '10.0.0.5',
      auditIdentityId: 'grpc-identity-1',
    };

    expect(buildContextAuditFields(ctx)).toEqual({
      auditIdentityId: 'grpc-identity-1',
      auditIpAddress: '10.0.0.5',
    });
  });
});
