import { resolve } from 'node:path';
import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { getEnv } from '../src/config/index.js';
import { createCodeMemoryPorts } from '../src/composition/create-code-memory-ports.js';
import { runCodeIndex } from '../src/knowledge/code-memory/code-index-runner.js';
import { sqlFromD1Client } from './lib/sql-from-d1-client.js';

function parseArgs(): {
  dryRun: boolean;
  ownerId: string;
  repository: string;
  rootDir: string;
  gitCommit?: string;
} {
  const dryRun = !process.argv.includes('--execute');
  const ownerArg = process.argv.find((arg) => arg.startsWith('--owner='));
  const repoArg = process.argv.find((arg) => arg.startsWith('--repository='));
  const rootArg = process.argv.find((arg) => arg.startsWith('--root='));
  const commitArg = process.argv.find((arg) => arg.startsWith('--commit='));
  const ownerId = ownerArg?.split('=')[1] ?? process.env.MCP_OWNER_ID ?? '';
  const repository = repoArg?.split('=')[1] ?? 'local/repo';
  const rootDir = resolve(rootArg?.split('=')[1] ?? process.cwd());
  if (!ownerId) {
    throw new Error('Pass --owner=<uuid> or set MCP_OWNER_ID');
  }
  return {
    dryRun,
    ownerId,
    repository,
    rootDir,
    gitCommit: commitArg?.split('=')[1],
  };
}

async function main(): Promise<void> {
  const args = parseArgs();
  const env = getEnv();

  console.log(`Code Memory index (${args.dryRun ? 'dry-run' : 'execute'})...`);
  console.log(`  CODE_MEMORY_ENABLED=${env.CODE_MEMORY_ENABLED}`);
  console.log(`  CODE_STORE_PROVIDER=${env.CODE_STORE_PROVIDER}`);
  console.log(`  repository=${args.repository}`);
  console.log(`  root=${args.rootDir}`);

  const client = getD1Client();
  await runMigrations(client);
  const sql = sqlFromD1Client(client);
  const ports = createCodeMemoryPorts(sql, env);

  const report = await runCodeIndex({
    ...args,
    ports,
    sql,
  });

  console.log(JSON.stringify(report, null, 2));
  if (!report.enabled) {
    console.log('Flag off or store disabled — extract stats only; nothing persisted.');
  }
}

main().catch((error) => {
  console.error('Code Memory index failed:', error);
  process.exit(1);
});
