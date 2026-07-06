import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { generateId, nowISO } from '../utils/memory-mapper.js';
import type { Identity, IdentityMetadata, IdentityRow } from './auth.types.js';
import { metadataToJson, rowToIdentity } from './identity.mapper.js';

export interface InsertIdentityData {
  id?: string;
  type: string;
  name: string;
  secretHash: string | null;
  ownerId: string;
  description?: string;
  metadata?: IdentityMetadata;
  clientId?: string | null;
  createdBy?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
}

export class IdentityRepository {
  constructor(private readonly db: ISqlDatabase) {}

  async insert(data: InsertIdentityData): Promise<Identity> {
    const id = data.id ?? generateId();
    const now = data.createdAt ?? nowISO();
    const metadata = metadataToJson(
      data.metadata ?? { permissions: ['memory.read', 'memory.write'] },
    );

    await this.db.execute(
      `INSERT INTO identities (
        id, type, name, secret_hash, owner_id, description, metadata,
        client_id, created_by, created_at, expires_at, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id,
        data.type,
        data.name,
        data.secretHash,
        data.ownerId,
        data.description ?? '',
        metadata,
        data.clientId ?? null,
        data.createdBy ?? null,
        now,
        data.expiresAt ?? null,
      ],
    );

    const row = await this.findById(id);
    if (!row) throw new Error('Failed to retrieve inserted identity');
    return row;
  }

  async findById(id: string): Promise<Identity | null> {
    const rows = await this.db.query<IdentityRow>('SELECT * FROM identities WHERE id = ?', [id]);
    return rows[0] ? rowToIdentity(rows[0]) : null;
  }

  async findBySecretHash(hash: string): Promise<Identity | null> {
    const rows = await this.db.query<IdentityRow>(
      'SELECT * FROM identities WHERE secret_hash = ?',
      [hash],
    );
    return rows[0] ? rowToIdentity(rows[0]) : null;
  }

  async findByName(name: string): Promise<Identity | null> {
    const rows = await this.db.query<IdentityRow>(
      'SELECT * FROM identities WHERE name = ? AND active = 1',
      [name],
    );
    return rows[0] ? rowToIdentity(rows[0]) : null;
  }

  async countAll(): Promise<number> {
    const rows = await this.db.query<{ count: number | string }>(
      'SELECT COUNT(*) as count FROM identities',
    );
    return Number(rows[0]?.count ?? 0);
  }

  async listByOwner(ownerId?: string): Promise<Identity[]> {
    if (ownerId) {
      const rows = await this.db.query<IdentityRow>(
        'SELECT * FROM identities WHERE owner_id = ? ORDER BY created_at DESC',
        [ownerId],
      );
      return rows.map(rowToIdentity);
    }

    const rows = await this.db.query<IdentityRow>(
      'SELECT * FROM identities ORDER BY created_at DESC',
    );
    return rows.map(rowToIdentity);
  }

  async updateLastUsed(id: string): Promise<void> {
    await this.db.execute('UPDATE identities SET last_used_at = ? WHERE id = ?', [nowISO(), id]);
  }

  async revoke(id: string): Promise<Identity | null> {
    const now = nowISO();
    await this.db.execute('UPDATE identities SET active = 0, revoked_at = ? WHERE id = ?', [
      now,
      id,
    ]);
    return this.findById(id);
  }

  async rotateSecret(id: string, newHash: string): Promise<void> {
    await this.db.execute(
      'UPDATE identities SET secret_hash = ?, last_used_at = NULL WHERE id = ?',
      [newHash, id],
    );
  }
}
