import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { getEnv } from '../src/config/index.js';
import { createInspectionLedgerPorts } from '../src/composition/create-inspection-ledger-ports.js';
import { sqlFromD1Client } from './lib/sql-from-d1-client.js';

function parseArgs(): { dryRun: boolean; ownerId?: string } {
  const dryRun = !process.argv.includes('--execute');
  const ownerArg = process.argv.find((arg) => arg.startsWith('--owner='));
  const ownerId = ownerArg?.split('=')[1];
  return { dryRun, ownerId };
}

async function runInspectionMiner(): Promise<void> {
  const { dryRun, ownerId } = parseArgs();
  const env = getEnv();

  console.log(`Inspection pattern ledger (${dryRun ? 'dry-run' : 'execute'})...`);
  console.log(`  INSPECTION_LEDGER_ENABLED=${env.INSPECTION_LEDGER_ENABLED}`);
  console.log(`  LEARNING_ENGINE_ENABLED=${env.LEARNING_ENGINE_ENABLED}`);

  if (!env.INSPECTION_LEDGER_ENABLED) {
    console.log('Inspection ledger disabled — enable INSPECTION_LEDGER_ENABLED=true to run.');
    return;
  }

  const client = getD1Client();
  await runMigrations(client);
  const sql = sqlFromD1Client(client);
  const { orchestrator } = createInspectionLedgerPorts(sql, env);

  const owners = ownerId
    ? [{ owner_id: ownerId }]
    : await client.query<{ owner_id: string }>(
        'SELECT DISTINCT owner_id FROM learning_events WHERE owner_id != ?',
        [''],
      );

  if (owners.length === 0) {
    console.log('No learning event owners found.');
    return;
  }

  for (const { owner_id: scopeOwnerId } of owners) {
    const report = await orchestrator.run({ ownerId: scopeOwnerId }, { dryRun });
    console.log(`Owner ${scopeOwnerId}:`);
    console.log(`  events scanned: ${report.eventsScanned}`);
    console.log(`  patterns upserted: ${report.patternsUpserted}`);
    console.log(`  contradictions: ${report.contradictionsFound}`);
    console.log(`  charter promoted: ${report.charterPromoted}`);
    console.log(`  confidence refreshed: ${report.confidenceRefreshed}`);
  }
}

runInspectionMiner().catch((error) => {
  console.error('Inspection miner failed:', error);
  process.exit(1);
});
