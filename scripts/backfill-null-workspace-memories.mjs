/**
 * One-shot: backfill memories with NULL workspace_id for MCP owner
 * onto the owner's Default workspace (Studio/MCP alignment).
 *
 * Usage: node scripts/backfill-null-workspace-memories.mjs
 * Dry-run: DRY_RUN=1 node scripts/backfill-null-workspace-memories.mjs
 */
import fs from 'node:fs';

const env = Object.fromEntries(
  fs
    .readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const OWNER_ID = env.MCP_OWNER_ID?.trim() || '3d7a5c31-8e16-4855-bc13-83bd1b1d89c3';
const WORKSPACE_ID =
  env.MCP_WORKSPACE_ID?.trim() || 'f599be05-0e83-4105-849a-1d68262ea0cc';
const dryRun = process.env.DRY_RUN === '1';

async function query(sql, params = []) {
  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${env.D1_DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.D1_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    },
  );
  const j = await r.json();
  if (!j.success) {
    throw new Error(JSON.stringify(j.errors ?? j));
  }
  return j.result?.[0] ?? { results: [], meta: {} };
}

const before = await query(
  `SELECT COUNT(1) AS c FROM memories WHERE owner_id = ? AND workspace_id IS NULL`,
  [OWNER_ID],
);
const nullCount = before.results?.[0]?.c ?? 0;
console.log(`Owner ${OWNER_ID}`);
console.log(`Target workspace ${WORKSPACE_ID}`);
console.log(`Null workspace_id rows: ${nullCount}`);

if (nullCount === 0) {
  console.log('Nothing to backfill.');
  process.exit(0);
}

if (dryRun) {
  const sample = await query(
    `SELECT id, substr(title, 1, 60) AS title FROM memories WHERE owner_id = ? AND workspace_id IS NULL LIMIT 20`,
    [OWNER_ID],
  );
  console.log('DRY_RUN sample:', sample.results);
  process.exit(0);
}

const updated = await query(
  `UPDATE memories SET workspace_id = ? WHERE owner_id = ? AND workspace_id IS NULL`,
  [WORKSPACE_ID, OWNER_ID],
);
console.log('D1 meta:', updated.meta);

const afterNull = await query(
  `SELECT COUNT(1) AS c FROM memories WHERE owner_id = ? AND workspace_id IS NULL`,
  [OWNER_ID],
);
const afterWs = await query(
  `SELECT COUNT(1) AS c FROM memories WHERE owner_id = ? AND workspace_id = ?`,
  [OWNER_ID, WORKSPACE_ID],
);
console.log(`Remaining null: ${afterNull.results?.[0]?.c ?? 0}`);
console.log(`In target workspace: ${afterWs.results?.[0]?.c ?? 0}`);
