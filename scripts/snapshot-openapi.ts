/**
 * Export full OpenAPI JSON from a running Fastify app to packages/openapi/openapi.snapshot.json.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildApp } from '../src/server.js';
import { setD1Client, resetD1Client } from '../src/db/index.js';
import { MockD1Client } from '../tests/helpers/mock-d1.js';

process.env.CLOUDFLARE_ACCOUNT_ID ??= 'snapshot-account';
process.env.D1_DATABASE_ID ??= 'snapshot-db';
process.env.D1_API_TOKEN ??= 'snapshot-token';
process.env.AUTH_SECRET ??= 'snapshot-auth-secret-minimum-32-chars!!';
process.env.NODE_ENV ??= 'test';

async function main(): Promise<void> {
  resetD1Client();
  setD1Client(new MockD1Client());

  const app = await buildApp({ logger: false, skipAuth: true });
  await app.ready();

  const response = await app.inject({ method: 'GET', url: '/docs/json' });
  if (response.statusCode !== 200) {
    throw new Error(`Failed to fetch OpenAPI: HTTP ${response.statusCode}`);
  }

  const outPath = resolve(process.cwd(), 'packages/openapi/openapi.snapshot.json');
  writeFileSync(outPath, JSON.stringify(response.json(), null, 2), 'utf8');
  console.log(`Wrote ${outPath}`);

  await app.close();
  resetD1Client();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
