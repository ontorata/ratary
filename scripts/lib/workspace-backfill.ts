import { ensureDefaultWorkspace } from '../../src/scope/workspace-store.js';
import type { D1Client } from '../../src/db/d1-client.js';

export { DEFAULT_WORKSPACE_SLUG, DEFAULT_WORKSPACE_NAME } from '../../src/scope/workspace-store.js';
export interface WorkspaceBackfillResult {
  ownersProcessed: number;
  workspacesCreated: number;
  memoriesUpdated: number;
  remainingNull: number;
}

/**
 * ADR-007 backfill (idempotent):
 * 1. Ensure a default workspace per distinct owner in memories.
 * 2. Assign memories.workspace_id where NULL.
 * 3. Report remaining NULL rows (must be 0 on success).
 */
export async function backfillDefaultWorkspaces(
  client: D1Client,
  now: () => string = () => new Date().toISOString(),
): Promise<WorkspaceBackfillResult> {
  const owners = await client.query<{ owner_id: string }>(
    `SELECT DISTINCT owner_id FROM memories WHERE workspace_id IS NULL`,
  );

  let workspacesCreated = 0;
  let memoriesUpdated = 0;

  for (const { owner_id: ownerId } of owners) {
    const { workspace, created } = await ensureDefaultWorkspace(client, ownerId, now);
    if (created) {
      workspacesCreated++;
    }

    const result = await client.execute(
      `UPDATE memories SET workspace_id = ? WHERE owner_id = ? AND workspace_id IS NULL`,
      [workspace.id, ownerId],
    );
    memoriesUpdated += result.meta?.changes ?? 0;
  }

  const remaining = await client.query<{ count: number }>(
    `SELECT COUNT(*) AS count FROM memories WHERE workspace_id IS NULL`,
  );

  return {
    ownersProcessed: owners.length,
    workspacesCreated,
    memoriesUpdated,
    remainingNull: remaining[0]?.count ?? 0,
  };
}
