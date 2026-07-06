import { describe, expect, it, vi } from 'vitest';
import type { Identity } from '../auth.types.js';
import type { IdentityRepository } from '../identity.repository.js';
import { StudioOidcAccessTokenProvider } from './studio-oidc-access-token.provider.js';
import { studioOidcIdentityName } from './oidc-token-utils.js';

const ISSUER = 'https://auth-ql6ohn.au1.zitadel.cloud';
const SUBJECT = 'user-123';

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

function mockRepo(overrides: Partial<IdentityRepository> = {}): IdentityRepository {
  return {
    findByName: vi.fn().mockResolvedValue(null),
    insert: vi.fn().mockImplementation(async (data) => ({
      id: 'identity-new',
      type: data.type,
      name: data.name,
      secretHash: null,
      ownerId: data.ownerId,
      description: data.description ?? '',
      metadata: data.metadata ?? { permissions: ['memory.read', 'memory.write'] },
      clientId: null,
      createdBy: null,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      active: true,
      lastUsedAt: null,
    })),
    ...overrides,
  } as unknown as IdentityRepository;
}

describe('StudioOidcAccessTokenProvider', () => {
  const token = makeJwt({ iss: ISSUER, sub: SUBJECT, exp: Math.floor(Date.now() / 1000) + 3600 });

  it('returns null when STUDIO_OIDC_ENABLED is false', async () => {
    const provider = new StudioOidcAccessTokenProvider({
      env: { STUDIO_OIDC_ENABLED: false, OIDC_ISSUER_URL: ISSUER } as never,
      identityRepository: mockRepo(),
    });

    const result = await provider.authenticate({
      headers: { authorization: `Bearer ${token}` },
    });
    expect(result).toBeNull();
  });

  it('provisions a new identity on first login', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sub: SUBJECT, email: 'u@example.com', name: 'User' }),
    });
    const repo = mockRepo();

    const provider = new StudioOidcAccessTokenProvider({
      env: { STUDIO_OIDC_ENABLED: true, OIDC_ISSUER_URL: ISSUER } as never,
      identityRepository: repo,
      fetchImpl,
    });

    const result = await provider.authenticate({
      headers: { authorization: `Bearer ${token}` },
    });

    expect(result).toMatchObject({
      identityId: 'identity-new',
      type: 'oauth',
    });
    expect(repo.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: studioOidcIdentityName(SUBJECT),
        type: 'oauth',
      }),
    );
  });

  it('reuses existing identity for the same subject', async () => {
    const existing: Identity = {
      id: 'identity-existing',
      type: 'oauth',
      name: studioOidcIdentityName(SUBJECT),
      ownerId: 'owner-abc',
      description: '',
      metadata: { permissions: ['memory.read', 'memory.write'] },
      clientId: null,
      createdBy: null,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      active: true,
      lastUsedAt: null,
      revokedAt: null,
    };
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sub: SUBJECT }),
    });
    const repo = mockRepo({
      findByName: vi.fn().mockResolvedValue(existing),
    });

    const provider = new StudioOidcAccessTokenProvider({
      env: { STUDIO_OIDC_ENABLED: true, OIDC_ISSUER_URL: ISSUER } as never,
      identityRepository: repo,
      fetchImpl,
    });

    const result = await provider.authenticate({
      headers: { authorization: `Bearer ${token}` },
    });

    expect(result).toMatchObject({
      identityId: 'identity-existing',
      ownerId: 'owner-abc',
    });
    expect(repo.insert).not.toHaveBeenCalled();
  });
});
