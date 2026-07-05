/**
 * Smoke test knowledge-fabric Notion sync against a Ratary host.
 * Usage:
 *   RATARY_API_KEY=aic_... npx tsx scripts/test-notion-sync.ts --url https://ratary.ontorata.com
 *   npx tsx scripts/test-notion-sync.ts --url http://localhost:9876 --dry-run
 */
import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RataryClient } from '../packages/sdk/src/index.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(repoRoot, '.env'), quiet: true });

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1 || i + 1 >= process.argv.length) return undefined;
  return process.argv[i + 1];
}

const baseUrl = arg('--url') ?? process.env.RATARY_BASE_URL ?? 'http://localhost:9876';
const apiKey = process.env.RATARY_API_KEY ?? process.env.API_KEY;
const dryRun = process.argv.includes('--dry-run');
const live = process.argv.includes('--live');

async function main(): Promise<void> {
  if (!apiKey) {
    console.error('Set RATARY_API_KEY (or API_KEY) in the environment.');
    process.exit(1);
  }

  const client = new RataryClient({ baseUrl, apiKey });
  console.log(`Host: ${baseUrl}`);
  console.log(`Mode: ${dryRun ? 'dry-run' : live ? 'live ingest' : 'incremental ingest'}\n`);

  const caps = await client.capabilities.get();
  const fabric = (caps as { capabilities?: { supportsKnowledgeFabric?: boolean } }).capabilities
    ?.supportsKnowledgeFabric;
  console.log('supportsKnowledgeFabric:', fabric ?? 'unknown');

  const status = await client.admin.knowledgeFabric.getStatus();
  console.log('fabric status:', JSON.stringify(status, null, 2));

  const { connectors } = await client.admin.knowledgeFabric.listConnectors();
  const notion = connectors.find((c) => c.id === 'notion');
  console.log('notion connector:', notion ?? 'not listed');

  if (!notion?.configured) {
    console.warn(
      '\nNotion not configured on server. Set NOTION_API_TOKEN + CONNECTOR_SYNC_ENABLED=true (and KNOWLEDGE_FABRIC_ENABLED=true).',
    );
  }

  const run = await client.admin.knowledgeFabric.ingest('notion', {
    mode: 'incremental',
    dryRun,
    limit: 5,
  });
  console.log('\ningest result:', JSON.stringify(run, null, 2));
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
