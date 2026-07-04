import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { getEnv } from '../src/config/index.js';
import { createCompressionPorts } from '../src/composition/create-compression-ports.js';
import { sqlFromD1Client } from './lib/sql-from-d1-client.js';

function parseArgs(): { dryRun: boolean; projectId?: string } {
  const dryRun = !process.argv.includes('--execute');
  const projectArg = process.argv.find((arg) => arg.startsWith('--project='));
  const projectId = projectArg?.split('=')[1];
  return { dryRun, projectId };
}

async function compressMemories(): Promise<void> {
  const { dryRun, projectId } = parseArgs();
  console.log(`Semantic compression (${dryRun ? 'dry-run' : 'execute'})...`);

  const env = getEnv();
  if (!env.COMPRESSION_ENABLED) {
    console.log('Note: COMPRESSION_ENABLED=false — runner will report zero candidates.');
  }

  const client = getD1Client();
  await runMigrations(client);

  const sql = sqlFromD1Client(client);
  const { runner } = createCompressionPorts(sql, env);

  const owners = await client.query<{ owner_id: string }>(
    'SELECT DISTINCT owner_id FROM memories WHERE owner_id != ?',
    [''],
  );

  if (owners.length === 0) {
    console.log('No memories found.');
    return;
  }

  for (const { owner_id: ownerId } of owners) {
    const report = await runner.run({ ownerId }, { dryRun, projectId });
    console.log(`Owner ${ownerId}:`);
    console.log(`  candidates: ${report.candidates}`);
    console.log(`  compressed: ${report.compressed}`);
    console.log(`  dryRun: ${report.dryRun}`);
  }
}

compressMemories().catch((error) => {
  console.error('Compression failed:', error);
  process.exit(1);
});
