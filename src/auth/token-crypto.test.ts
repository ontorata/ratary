import { describe, expect, it } from 'vitest';
import { encryptStudioToken, decryptStudioToken, isEncryptedStudioToken, resolveBearerJwt } from './token-crypto.js';
import { JwtService } from './jwt.service.js';

describe('token-crypto', () => {
  const jwt = new JwtService();
  const signed = jwt.sign({
    identityId: '11111111-1111-4111-8111-111111111111',
    ownerId: '22222222-2222-4222-8222-222222222222',
    clientId: null,
    permissions: ['memory.read'],
    audience: 'studio',
    issuer: 'ratary',
  });

  it('encrypts JWT into opaque rat1 token', () => {
    const enc = encryptStudioToken(signed);
    expect(isEncryptedStudioToken(enc)).toBe(true);
    expect(enc).not.toContain('eyJ');
    const plain = decryptStudioToken(enc);
    expect(plain).toBe(signed);
  });

  it('resolveBearerJwt decrypts or passes through JWT', () => {
    const enc = encryptStudioToken(signed);
    expect(resolveBearerJwt(enc)).toBe(signed);
    expect(resolveBearerJwt(signed)).toBe(signed);
    expect(resolveBearerJwt('bad')).toBeNull();
  });
});
