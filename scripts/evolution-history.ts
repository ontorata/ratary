import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { getEnv } from '../src/config/index.js';
import { createMemoryEvolutionPorts } from '../src/composition/create-memory-evolution-ports.js';
import { sqlFromD1Client } from './lib/sql-from-d1-client.js';

function parseArgs(): { memoryId?: string; ownerId?: string } {
  const memoryArg = process.argv.find((arg) => arg.startsWith('--memory='));
  const ownerArg = process.argv.find((arg) => arg.startsWith('--owner='));
  return {
    memoryId: memoryArg?.split('=')[1],
    ownerId: ownerArg?.split('=')[1],
  };
}

async function evolutionHistory(): Promise<void> {
  const { memoryId, ownerId } = parseArgs();
  const env = getEnv();

  console.log('Memory evolution history...');
  console.log(`  MEMORY_EVOLUTION_ENABLED=${env.MEMORY_EVOLUTION_ENABLED}`);

  if (!env.MEMORY_EVOLUTION_ENABLED) {
    console.log('Memory evolution disabled — enable MEMORY_EVOLUTION_ENABLED=true.');
    return;
  }

  if (!memoryId || !ownerId) {
    console.log('Usage: npm run evolution:history -- --memory=<uuid> --owner=<ownerId>');
    return;
  }

  const client = getD1Client();
  await runMigrations(client);
  const sql = sqlFromD1Client(client);
  const { service } = createMemoryEvolutionPorts(sql, env);

  if (!service) {
    console.log('Evolution service not available.');
    return;
  }

  const result = await service.listVersions({ ownerId }, memoryId);
  console.log(`Head: version ${result.head?.currentVersion ?? 0} (${result.head?.branchName ?? 'main'})`);
  for (const version of result.versions) {
    console.log(`  v${version.versionNumber} — ${version.createdAt} (confidence ${version.confidence})`);
  }
}

evolutionHistory().catch((error) => {
  console.error('Evolution history failed:', error);
  process.exit(1);
});
