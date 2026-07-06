/**
 * Smoke test knowledge-fabric Notion sync (alias for test-connector-sync.ts).
 * Usage:
 *   RATARY_API_KEY=aic_... npx tsx scripts/test-notion-sync.ts --url https://ratary.ontorata.com
 */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = resolve(dirname(fileURLToPath(import.meta.url)), 'test-connector-sync.ts');
const args = ['tsx', script, '--connector', 'notion', ...process.argv.slice(2)];
const result = spawnSync('npx', args, { stdio: 'inherit', shell: true });
process.exit(result.status ?? 1);
