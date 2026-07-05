import { describe, it, expect } from 'vitest';
import { backfillOrganizations } from '../../scripts/lib/organization-backfill.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('backfillOrganizations', () => {
  it('should create default org and link workspaces idempotently', async () => {
    const db = new MockD1Client();
    const ownerId = '00000000-0000-4000-8000-000000000001';
    const workspaceId = '00000000-0000-4000-8000-0000000000aa';

    await db.execute(
      `INSERT INTO workspaces (id, owner_id, name, slug, created_at) VALUES (?, ?, ?, ?, ?)`,
      [workspaceId, ownerId, 'Default', 'default', '2026-07-03T00:00:00.000Z'],
    );

    const first = await backfillOrganizations(db, () => '2026-07-03T00:00:00.000Z');
    expect(first.organizationsCreated).toBe(1);
    expect(first.workspacesLinked).toBeGreaterThanOrEqual(1);
    expect(first.remainingUnlinked).toBe(0);

    const second = await backfillOrganizations(db, () => '2026-07-03T00:00:00.000Z');
    expect(second.organizationsCreated).toBe(0);
    expect(second.remainingUnlinked).toBe(0);
  });
});
