import { describe, expect, it, vi } from 'vitest';
import { JwtService } from '../../src/auth/jwt.service.js';
import { ForbiddenError, UnauthorizedError } from '../../src/types/errors.js';

vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');

describe('JwtService', () => {
  const jwtService = new JwtService();

  it('should sign and verify a JWT', () => {
    const token = jwtService.sign({
      identityId: '00000000-0000-4000-8000-000000000001',
      ownerId: '00000000-0000-4000-8000-000000000002',
      clientId: null,
      permissions: ['memory.read', 'memory.write'],
      expiresInSec: 3600,
    });

    const claims = jwtService.verify(token);
    expect(claims.sub).toBe('00000000-0000-4000-8000-000000000001');
    expect(claims.owner_id).toBe('00000000-0000-4000-8000-000000000002');
    expect(claims.permissions).toEqual(['memory.read', 'memory.write']);
  });

  it('should reject tampered JWT', () => {
    const token = jwtService.sign({
      identityId: '00000000-0000-4000-8000-000000000001',
      ownerId: '00000000-0000-4000-8000-000000000002',
      clientId: null,
      permissions: ['memory.read'],
    });

    const tampered = `${token.slice(0, -1)}x`;
    expect(() => jwtService.verify(tampered)).toThrow(UnauthorizedError);
  });

  it('should reject expired JWT', () => {
    const token = jwtService.sign({
      identityId: '00000000-0000-4000-8000-000000000001',
      ownerId: '00000000-0000-4000-8000-000000000002',
      clientId: null,
      permissions: ['memory.read'],
      expiresInSec: -10,
    });

    expect(() => jwtService.verify(token)).toThrow(ForbiddenError);
  });
});
