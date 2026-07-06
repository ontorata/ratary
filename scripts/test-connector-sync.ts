/**
 * Smoke test knowledge-fabric connector ingest against a Ratary host.
 * Usage:
 *   RATARY_API_KEY=aic_... npx tsx scripts/test-connector-sync.ts --connector notion --url https://ratary.ontorata.com
 *   npx tsx scripts/test-connector-sync.ts --connector confluence --url https://ratary.ontorata.com --dry-run
 *   npx tsx scripts/test-connector-sync.ts --connector drive --url https://ratary.ontorata.com --dry-run
 */
import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RataryClient } from '../packages/sdk/src/index.js';

const CONNECTORS = ['notion', 'confluence', 'drive', 'sharepoint', 'teams'] as const;
type ConnectorName = (typeof CONNECTORS)[number];

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
const connectorArg = arg('--connector') ?? 'notion';

const CONFIG_HINTS: Record<ConnectorName, string> = {
  notion:
    'Set NOTION_API_TOKEN + KNOWLEDGE_FABRIC_ENABLED=true + CONNECTOR_SYNC_ENABLED=true.',
  confluence:
    'Set CONFLUENCE_BASE_URL, CONFLUENCE_EMAIL, CONFLUENCE_API_TOKEN + fabric flags.',
  drive:
    'Set GOOGLE_DRIVE_CREDENTIALS_JSON (service account JSON) + optional GOOGLE_DRIVE_FOLDER_ID + fabric flags.',
  sharepoint:
    'Set SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET, SHAREPOINT_SITE_ID + fabric flags.',
  teams:
    'Set Microsoft Graph creds + TEAMS_TEAM_ID + TEAMS_CHANNEL_ID + fabric flags.',
};

async function main(): Promise<void> {
  if (!apiKey) {
    console.error('Set RATARY_API_KEY (or API_KEY) in the environment.');
    process.exit(1);
  }

  if (!CONNECTORS.includes(connectorArg as ConnectorName)) {
    console.error(`--connector must be one of: ${CONNECTORS.join(', ')}`);
    process.exit(1);
  }
  const connector = connectorArg as ConnectorName;

  const client = new RataryClient({ baseUrl, apiKey });
  console.log(`Host: ${baseUrl}`);
  console.log(`Connector: ${connector}`);
  console.log(`Mode: ${dryRun ? 'dry-run' : live ? 'live ingest' : 'incremental ingest'}\n`);

  const caps = await client.capabilities.get();
  const fabric = (caps as { capabilities?: { supportsKnowledgeFabric?: boolean } }).capabilities
    ?.supportsKnowledgeFabric;
  console.log('supportsKnowledgeFabric:', fabric ?? 'unknown');

  const status = await client.admin.knowledgeFabric.getStatus();
  console.log('fabric status:', JSON.stringify(status, null, 2));

  const { connectors } = await client.admin.knowledgeFabric.listConnectors();
  const entry = connectors.find((c) => c.id === connector);
  console.log(`${connector} connector:`, entry ?? 'not listed');

  if (!entry?.configured) {
    console.warn(`\n${connector} not configured on server. ${CONFIG_HINTS[connector]}`);
  }

  const run = await client.admin.knowledgeFabric.ingest(connector, {
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
