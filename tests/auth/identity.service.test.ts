import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IdentityService } from '../../src/auth/identity.service.js';
import { IdentityRepository } from '../../src/auth/identity.repository.js';
import { SettingsRepository } from '../../src/auth/settings.repository.js';
import { JwtService } from '../../src/auth/jwt.service.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { ForbiddenError } from '../../src/types/errors.js';

vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');

describe('IdentityService', () => {
  let service: IdentityService;
  let mockDb: MockD1Client;

  beforeEach(() => {
    mockDb = new MockD1Client();
    const identityRepository = new IdentityRepository(mockDb);
    const settingsRepository = new SettingsRepository(mockDb);
    service = new IdentityService(mockDb, identityRepository, settingsRepository, new JwtService());
  });

  it('should report bootstrap available when db is empty', async () => {
    expect(await service.isBootstrapAvailable()).toBe(true);
  });

  it('should bootstrap and lock further bootstrap', async () => {
    const result = await service.bootstrap({ name: 'admin' });
    expect(result.apiKey).toMatch(/^aic_/);
    expect(result.ownerId).toBeDefined();

    expect(await service.isBootstrapAvailable()).toBe(false);

    await expect(service.bootstrap({ name: 'again' })).rejects.toThrow(ForbiddenError);
  });

  it('should create identity for actor owner', async () => {
    const boot = await service.bootstrap({ name: 'admin' });
    const created = await service.create(
      { name: 'ci', type: 'api_key', description: '' },
      { identityId: boot.identity.id, ownerId: boot.ownerId },
    );
    expect(created.apiKey).toMatch(/^aic_/);

    const list = await service.list(boot.ownerId);
    expect(list.length).toBeGreaterThanOrEqual(2);
  });

  it('should forbid revoke by other owner', async () => {
    const boot = await service.bootstrap({ name: 'admin' });
    const other = await service.create(
      {
        name: 'other',
        type: 'api_key',
        description: '',
        owner_id: '00000000-0000-4000-8000-000000000099',
      },
      { identityId: boot.identity.id, ownerId: boot.ownerId },
    );

    await expect(
      service.revoke(other.identity.id, '00000000-0000-4000-8000-000000000001'),
    ).rejects.toThrow(ForbiddenError);
  });
});
