import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { getEnv } from '../src/config/index.js';
import { AuditRepository } from '../src/auth/audit.repository.js';
import { createMultiClientSyncPorts } from '../src/composition/create-multi-client-sync-ports.js';
import { sqlFromD1Client } from './lib/sql-from-d1-client.js';

function parseArgs(): { platformId?: string; ownerId?: string } {
  const platformArg = process.argv.find((arg) => arg.startsWith('--platform='));
  const ownerArg = process.argv.find((arg) => arg.startsWith('--owner='));
  return {
    platformId: platformArg?.split('=')[1],
    ownerId: ownerArg?.split('=')[1],
  };
}

async function syncStatus(): Promise<void> {
  const { platformId, ownerId } = parseArgs();
  const env = getEnv();

  console.log('Multi-client sync status...');
  console.log(`  MULTI_CLIENT_SYNC_ENABLED=${env.MULTI_CLIENT_SYNC_ENABLED}`);
  console.log(`  MULTI_CLIENT_SYNC_STRATEGY=${env.MULTI_CLIENT_SYNC_STRATEGY}`);

  if (!env.MULTI_CLIENT_SYNC_ENABLED) {
    console.log('Multi-client sync disabled — enable MULTI_CLIENT_SYNC_ENABLED=true.');
    return;
  }

  if (!platformId || !ownerId) {
    console.log('Usage: npm run sync:status -- --platform=cursor --owner=<ownerId>');
    return;
  }

  const client = getD1Client();
  await runMigrations(client);
  const sql = sqlFromD1Client(client);
  const audit = new AuditRepository(sql);
  const ports = createMultiClientSyncPorts(sql, env, audit);

  if (!ports.enabled) {
    console.log('Client sync service not available — set MULTI_CLIENT_SYNC_STORE_PROVIDER=sql.');
    return;
  }

  const service = ports.createService(null);
  const status = await service.getStatus({ ownerId }, platformId);
  console.log(`Platform: ${status.platformId}`);
  console.log(`Strategy: ${status.strategy}`);
  console.log(`Cursor: ${status.cursor?.cursorValue ?? '(none)'}`);
  console.log(`Pending conflicts: ${status.pendingConflicts}`);
}

syncStatus().catch((error) => {
  console.error('Sync status failed:', error);
  process.exit(1);
});
