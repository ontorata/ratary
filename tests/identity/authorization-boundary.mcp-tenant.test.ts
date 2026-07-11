import { describe, expect, it } from 'vitest';
import { authorizeMcpRemoteSession } from '../../src/auth/authorization-boundary.js';
import type { AuthUser } from '../../src/auth/auth.types.js';
import { SqliteMemoryDatabase } from './helpers/sqlite-memory-db.js';

async function seedOrgTables(db: SqliteMemoryDatabase): Promise<void> {
  await db.execute(`
    CREATE TABLE organizations (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE workspaces (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      created_at TEXT NOT NULL,
      organization_id TEXT
    )
  `);
}

describe('authorizeMcpRemoteSession', () => {
  const auth: AuthUser = {
    identityId: 'id-1',
    id: 'id-1',
    ownerId: 'owner-1',
    identityType: 'api_key',
    clientId: null,
    permissions: ['memory.read'],
  };

  it('falls back to default org/workspace when tenant headers are absent', async () => {
    const db = new SqliteMemoryDatabase();
    await seedOrgTables(db);

    const enriched = await authorizeMcpRemoteSession(db, auth, {
      authorization: 'Bearer aic_test',
    });

    expect(enriched.organizationId).toBeTruthy();
    expect(enriched.workspaceId).toBeTruthy();
    expect(enriched.ownerId).toBe('owner-1');
    db.close();
  });

  it('uses explicit tenant headers when provided', async () => {
    const db = new SqliteMemoryDatabase();
    await seedOrgTables(db);
    await db.execute(
      `INSERT INTO organizations (id, owner_id, name, slug, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['org-explicit', 'owner-1', 'Explicit Org', 'explicit', '2026-01-01T00:00:00.000Z'],
    );
    await db.execute(
      `INSERT INTO workspaces (id, owner_id, name, slug, created_at, organization_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'ws-explicit',
        'owner-1',
        'Explicit',
        'explicit',
        '2026-01-01T00:00:00.000Z',
        'org-explicit',
      ],
    );

    const enriched = await authorizeMcpRemoteSession(db, auth, {
      'x-organization-id': 'org-explicit',
      'x-workspace-id': 'ws-explicit',
    });

    expect(enriched.organizationId).toBe('org-explicit');
    expect(enriched.workspaceId).toBe('ws-explicit');
    db.close();
  });
});
