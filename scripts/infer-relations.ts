import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { getEnv } from '../src/config/index.js';
import { createRelationInferencePorts } from '../src/composition/create-relation-inference-ports.js';
import { sqlFromD1Client } from './lib/sql-from-d1-client.js';

function parseArgs(): { dryRun: boolean; ownerId?: string; projectId?: string } {
  const dryRun = !process.argv.includes('--execute');
  const ownerArg = process.argv.find((arg) => arg.startsWith('--owner='));
  const projectArg = process.argv.find((arg) => arg.startsWith('--project='));
  return {
    dryRun,
    ownerId: ownerArg?.split('=')[1],
    projectId: projectArg?.split('=')[1],
  };
}

async function inferRelations(): Promise<void> {
  const { dryRun, ownerId, projectId } = parseArgs();
  const env = getEnv();

  console.log(`Relation inference (${dryRun ? 'dry-run' : 'execute'})...`);
  console.log(`  RELATION_INFERENCE_ENABLED=${env.RELATION_INFERENCE_ENABLED}`);
  console.log(`  RELATION_INFERENCE_STORE_PROVIDER=${env.RELATION_INFERENCE_STORE_PROVIDER}`);

  if (!env.RELATION_INFERENCE_ENABLED) {
    console.log('Relation inference disabled — enable RELATION_INFERENCE_ENABLED=true to run.');
    return;
  }

  const client = getD1Client();
  await runMigrations(client);
  const sql = sqlFromD1Client(client);
  const { orchestrator } = createRelationInferencePorts(sql, env);

  const owners = ownerId
    ? [{ owner_id: ownerId }]
    : await client.query<{ owner_id: string }>(
        'SELECT DISTINCT owner_id FROM memories WHERE owner_id != ?',
        [''],
      );

  if (owners.length === 0) {
    console.log('No owners found.');
    return;
  }

  for (const { owner_id: scopeOwnerId } of owners) {
    const report = await orchestrator.run({ ownerId: scopeOwnerId }, { dryRun, projectId });
    console.log(`Owner ${scopeOwnerId}:`);
    console.log(`  candidates: ${report.candidatesFound}`);
    console.log(`  created: ${report.relationsCreated}, updated: ${report.relationsUpdated}`);
    console.log(`  skipped (manual): ${report.relationsSkippedManual}`);
    console.log(`  by source: ${JSON.stringify(report.bySource)}`);
  }
}

inferRelations().catch((error) => {
  console.error('Relation inference failed:', error);
  process.exit(1);
});
