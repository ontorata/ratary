import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { backfillDefaultWorkspaces } from './lib/workspace-backfill.js';

async function backfillWorkspaces(): Promise<void> {
  console.log('Connecting to Cloudflare D1...');
  const client = getD1Client();
  await runMigrations(client);

  const result = await backfillDefaultWorkspaces(client);

  console.log(`Owners processed: ${result.ownersProcessed}`);
  console.log(`Workspaces created: ${result.workspacesCreated}`);
  console.log(`Memories updated: ${result.memoriesUpdated}`);

  if (result.remainingNull > 0) {
    console.error(`Verification failed: ${result.remainingNull} memories still have NULL workspace_id.`);
    process.exit(1);
  }

  console.log('Workspace backfill complete. All memories have workspace_id.');
}

backfillWorkspaces().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
