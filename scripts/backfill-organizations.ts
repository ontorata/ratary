import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { backfillOrganizations } from './lib/organization-backfill.js';

async function backfillOrganizationsScript(): Promise<void> {
  console.log('Connecting to Cloudflare D1...');
  const client = getD1Client();
  await runMigrations(client);

  const result = await backfillOrganizations(client);

  console.log(`Owners processed: ${result.ownersProcessed}`);
  console.log(`Organizations created: ${result.organizationsCreated}`);
  console.log(`Workspaces linked: ${result.workspacesLinked}`);

  if (result.remainingUnlinked > 0) {
    console.error(
      `Verification failed: ${result.remainingUnlinked} workspaces still have NULL organization_id.`,
    );
    process.exit(1);
  }

  console.log('Organization backfill complete. All workspaces have organization_id.');
}

backfillOrganizationsScript().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
