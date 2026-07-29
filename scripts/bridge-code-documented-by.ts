import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { getEnv } from '../src/config/index.js';
import { createCodeMemoryPorts } from '../src/composition/create-code-memory-ports.js';
import { bridgeCodeDocumentedBy } from '../src/knowledge/code-memory/code-documented-by-bridge.js';
import { sqlFromD1Client } from './lib/sql-from-d1-client.js';

function parseArgs(): {
  dryRun: boolean;
  ownerId: string;
  repository: string;
  projectId?: string;
} {
  const dryRun = !process.argv.includes('--execute');
  const ownerArg = process.argv.find((arg) => arg.startsWith('--owner='));
  const repoArg = process.argv.find((arg) => arg.startsWith('--repository='));
  const projectArg = process.argv.find((arg) => arg.startsWith('--project='));
  const ownerId = ownerArg?.split('=')[1] ?? process.env.MCP_OWNER_ID ?? '';
  if (!ownerId) {
    throw new Error('Pass --owner=<uuid> or set MCP_OWNER_ID');
  }
  return {
    dryRun,
    ownerId,
    repository: repoArg?.split('=')[1] ?? 'local/repo',
    projectId: projectArg?.split('=')[1],
  };
}

async function main(): Promise<void> {
  const args = parseArgs();
  const env = getEnv();

  console.log(`CODE_DOCUMENTED_BY bridge (${args.dryRun ? 'dry-run' : 'execute'})...`);
  console.log(`  CODE_MEMORY_ENABLED=${env.CODE_MEMORY_ENABLED}`);

  if (!env.CODE_MEMORY_ENABLED) {
    console.log('Code Memory disabled — enable CODE_MEMORY_ENABLED=true to run.');
    return;
  }

  const client = getD1Client();
  await runMigrations(client);
  const sql = sqlFromD1Client(client);
  const ports = createCodeMemoryPorts(sql, env);

  const report = await bridgeCodeDocumentedBy({
    ...args,
    ports,
    sql,
  });
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error('Code bridge failed:', error);
  process.exit(1);
});
