import type { D1Client } from '../../src/db/d1-client.js';
import {
  countOrphanWorkspaces,
  ensureDefaultOrganization,
} from '../../src/scope/organization-store.js';

export interface OrganizationBackfillResult {
  ownersProcessed: number;
  organizationsCreated: number;
  workspacesLinked: number;
  remainingUnlinked: number;
}

/**
 * Phase 10 / Identity Foundation backfill (idempotent):
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
    const { organization, created } = await ensureDefaultOrganization(client, ownerId, now);
    if (created) {
      organizationsCreated++;
    }

    const result = await client.execute(
      `UPDATE workspaces SET organization_id = ?
       WHERE owner_id = ? AND (organization_id IS NULL OR organization_id = '')`,
      [organization.id, ownerId],
    );
    workspacesLinked += result.meta?.changes ?? 0;
  }

  return {
    ownersProcessed: owners.length,
    organizationsCreated,
    workspacesLinked,
    remainingUnlinked: await countOrphanWorkspaces(client),
  };
}
