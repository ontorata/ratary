import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../src/auth/auth.service.js';
import { IdentityRepository } from '../../src/auth/identity.repository.js';
import { ApiKeyProvider } from '../../src/auth/providers/api-key.provider.js';
import { JwtProvider } from '../../src/auth/providers/jwt.provider.js';
import { OAuthProvider } from '../../src/auth/providers/oauth.provider.js';
import { JwtService } from '../../src/auth/jwt.service.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { UnauthorizedError } from '../../src/types/errors.js';
import { hashSecret, generateApiKeyPlaintext } from '../../src/auth/crypto.js';
import { executeTransaction } from '../../src/db/migrations.js';

vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');

async function seedIdentity(
  mockDb: MockD1Client,
  apiKey: string,
  ownerId: string,
): Promise<string> {
  const identityId = crypto.randomUUID();
  const now = new Date().toISOString();
  await executeTransaction(mockDb, [
    {
      sql: `INSERT INTO identities (
        id, type, name, secret_hash, owner_id, description, metadata,
        client_id, created_by, created_at, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      params: [
        identityId,
        'api_key',
        'test',
        hashSecret(apiKey),
        ownerId,
        '',
        '{}',
        null,
        identityId,
        now,
      ],
    },
  ]);
  return identityId;
}

describe('AuthService', () => {
  let authService: AuthService;
  let mockDb: MockD1Client;
  let identityRepository: IdentityRepository;

  beforeEach(() => {
    mockDb = new MockD1Client();
    identityRepository = new IdentityRepository(mockDb);
    const jwtService = new JwtService();
    authService = new AuthService(
      [
        new ApiKeyProvider(identityRepository),
        new OAuthProvider(identityRepository),
        new JwtProvider(jwtService, identityRepository),
      ],
      identityRepository,
    );
  });

  it('should authenticate valid API key', async () => {
    const apiKey = generateApiKeyPlaintext();
    const ownerId = crypto.randomUUID();
    await seedIdentity(mockDb, apiKey, ownerId);

    const user = await authService.authenticate({
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(user.ownerId).toBe(ownerId);
    expect(user.identityType).toBe('api_key');
  });

  it('should reject missing credentials', async () => {
    await expect(authService.authenticate({ headers: {} })).rejects.toThrow(UnauthorizedError);
  });

  it('should reject invalid API key', async () => {
    const wrongKey = `aic_${'0'.repeat(64)}`;
    await expect(
      authService.authenticate({
        headers: { authorization: `Bearer ${wrongKey}` },
      }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
