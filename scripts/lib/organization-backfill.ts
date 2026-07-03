import { randomUUID } from 'node:crypto';
import type { D1Client } from '../../src/db/d1-client.js';

export interface OrganizationBackfillResult {
  ownersProcessed: number;
  organizationsCreated: number;
  workspacesLinked: number;
  remainingUnlinked: number;
}

const DEFAULT_ORG_NAME = 'Default Organization';
const DEFAULT_ORG_SLUG = 'default';

/**
 * Phase 10 backfill (idempotent):
 * 1. Ensure a default organization per owner with workspaces missing organization_id.
 * 2. Set workspaces.organization_id for unlinked rows.
 */
export async function backfillOrganizations(
  client: D1Client,
  now: () => string = () => new Date().toISOString(),
): Promise<OrganizationBackfillResult> {
  const owners = await client.query<{ owner_id: string }>(
    `SELECT DISTINCT owner_id FROM workspaces WHERE organization_id IS NULL OR organization_id = ''`,
  );

  let organizationsCreated = 0;
  let workspacesLinked = 0;

  for (const { owner_id: ownerId } of owners) {
    const existingOrg = await client.query<{ id: string }>(
      `SELECT id FROM organizations WHERE owner_id = ? AND slug = ?`,
      [ownerId, DEFAULT_ORG_SLUG],
    );

    let organizationId = existingOrg[0]?.id;
    if (!organizationId) {
      organizationId = randomUUID();
      await client.execute(
        `INSERT INTO organizations (id, owner_id, name, slug, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [organizationId, ownerId, DEFAULT_ORG_NAME, DEFAULT_ORG_SLUG, now()],
      );
      organizationsCreated++;
    }

    const result = await client.execute(
      `UPDATE workspaces SET organization_id = ?
       WHERE owner_id = ? AND (organization_id IS NULL OR organization_id = '')`,
      [organizationId, ownerId],
    );
    workspacesLinked += result.meta?.changes ?? 0;
  }

  const remaining = await client.query<{ count: number }>(
    `SELECT COUNT(*) AS count FROM workspaces WHERE organization_id IS NULL OR organization_id = ''`,
  );

  return {
    ownersProcessed: owners.length,
    organizationsCreated,
    workspacesLinked,
    remainingUnlinked: remaining[0]?.count ?? 0,
  };
}
