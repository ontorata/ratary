import type { D1Client } from '../db/d1-client.js';
import type { IdentityRepository } from './identity.repository.js';
import type { SettingsRepository } from './settings.repository.js';
import { executeTransaction } from '../db/migrations.js';
import { generateId, nowISO } from '../utils/memory-mapper.js';
import { generateApiKeyPlaintext, hashSecret } from './crypto.js';
import { emitAuthEvent } from './events.js';
import { ForbiddenError, NotFoundError } from '../types/errors.js';
import type {
  BootstrapBody,
  CreateIdentityBody,
  Identity,
  IdentityMetadata,
} from './auth.types.js';
import { SETTINGS_KEYS } from './settings.repository.js';

export interface CreateIdentityResult {
  identity: Identity;
  apiKey: string;
}

export interface BootstrapResult extends CreateIdentityResult {
  ownerId: string;
  clientId: string | null;
}

export class IdentityService {
  constructor(
    private readonly db: D1Client,
    private readonly identityRepository: IdentityRepository,
    private readonly settingsRepository: SettingsRepository,
  ) {}

  async isBootstrapAvailable(): Promise<boolean> {
    const completed = await this.settingsRepository.isBootstrapCompleted();
    if (completed) return false;
    const count = await this.identityRepository.countAll();
    return count === 0;
  }

  async bootstrap(input: BootstrapBody): Promise<BootstrapResult> {
    const available = await this.isBootstrapAvailable();
    if (!available) {
      throw new ForbiddenError('Bootstrap is no longer available');
    }

    const ownerId = input.owner_id ?? generateId();
    const plaintext = generateApiKeyPlaintext();
    const secretHash = hashSecret(plaintext);
    const identityId = generateId();
    const now = nowISO();

    let clientId: string | null = null;
    const statements: { sql: string; params?: unknown[] }[] = [];

    if (input.client) {
      clientId = generateId();
      statements.push({
        sql: `INSERT INTO clients (id, name, type, description, metadata, created_at, active)
              VALUES (?, ?, ?, ?, ?, ?, 1)`,
        params: [
          clientId,
          input.client.name,
          input.client.type,
          input.client.description ?? '',
          '{}',
          now,
        ],
      });
    }

    const metadata: IdentityMetadata = {
      permissions: ['memory.read', 'memory.write'],
    };

    statements.push({
      sql: `INSERT INTO identities (
        id, type, name, secret_hash, owner_id, description, metadata,
        client_id, created_by, created_at, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      params: [
        identityId,
        'api_key',
        input.name,
        secretHash,
        ownerId,
        input.description ?? '',
        JSON.stringify(metadata),
        clientId,
        identityId,
        now,
      ],
    });

    statements.push({
      sql: `INSERT INTO settings (key, value) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      params: [SETTINGS_KEYS.BOOTSTRAP_COMPLETED, 'true'],
    });

    await executeTransaction(this.db, statements);

    const identity = await this.identityRepository.findById(identityId);
    if (!identity) throw new Error('Bootstrap identity not found after insert');

    emitAuthEvent({
      event: 'bootstrap.completed',
      identityId: identity.id,
      ownerId,
      clientId,
      metadata: { name: input.name },
    });

    emitAuthEvent({
      event: 'identity.created',
      identityId: identity.id,
      ownerId,
      clientId,
    });

    return { identity, apiKey: plaintext, ownerId, clientId };
  }

  async create(
    input: CreateIdentityBody,
    actor: { identityId: string; ownerId: string },
  ): Promise<CreateIdentityResult> {
    const ownerId = input.owner_id ?? actor.ownerId;
    const plaintext = generateApiKeyPlaintext();
    const secretHash = hashSecret(plaintext);

    const identity = await this.identityRepository.insert({
      type: input.type,
      name: input.name,
      secretHash,
      ownerId,
      description: input.description,
      metadata: input.metadata ?? { permissions: ['memory.read', 'memory.write'] },
      clientId: input.client_id ?? null,
      createdBy: actor.identityId,
      expiresAt: input.expires_at ?? null,
    });

    emitAuthEvent({
      event: 'identity.created',
      identityId: identity.id,
      ownerId: identity.ownerId,
      clientId: identity.clientId,
    });

    return { identity, apiKey: plaintext };
  }

  async list(ownerId?: string): Promise<Identity[]> {
    return this.identityRepository.listByOwner(ownerId);
  }

  async revoke(id: string, actorOwnerId: string): Promise<Identity> {
    const identity = await this.identityRepository.findById(id);
    if (!identity) throw new NotFoundError('Identity', id);
    if (identity.ownerId !== actorOwnerId) {
      throw new ForbiddenError('Cannot revoke identity owned by another user');
    }

    const revoked = await this.identityRepository.revoke(id);
    if (!revoked) throw new NotFoundError('Identity', id);

    emitAuthEvent({
      event: 'identity.revoked',
      identityId: id,
      ownerId: identity.ownerId,
      clientId: identity.clientId,
    });

    return revoked;
  }

  async rotate(id: string, actorOwnerId: string): Promise<CreateIdentityResult> {
    const identity = await this.identityRepository.findById(id);
    if (!identity) throw new NotFoundError('Identity', id);
    if (identity.ownerId !== actorOwnerId) {
      throw new ForbiddenError('Cannot rotate identity owned by another user');
    }
    if (!identity.active) {
      throw new ForbiddenError('Cannot rotate revoked identity');
    }

    const plaintext = generateApiKeyPlaintext();
    const secretHash = hashSecret(plaintext);
    await this.identityRepository.rotateSecret(id, secretHash);

    const updated = await this.identityRepository.findById(id);
    if (!updated) throw new NotFoundError('Identity', id);

    emitAuthEvent({
      event: 'identity.rotated',
      identityId: id,
      ownerId: identity.ownerId,
      clientId: identity.clientId,
    });

    return { identity: updated, apiKey: plaintext };
  }

  async verifyByPlaintext(plaintext: string): Promise<Identity> {
    const hash = hashSecret(plaintext);
    const identity = await this.identityRepository.findBySecretHash(hash);
    if (!identity) throw new NotFoundError('Identity');
    return identity;
  }
}
