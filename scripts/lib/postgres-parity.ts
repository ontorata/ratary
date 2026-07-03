import type { ISqlDatabase } from '../../src/ports/sql/isql-database.port.js';
import { METADATA_BACKFILL_TABLES, type BackfillTableSpec } from './d1-to-postgres-backfill.js';

export interface TableParityResult {
  table: string;
  sourceCount: number;
  targetCount: number;
  match: boolean;
}

export interface PostgresParityResult {
  ok: boolean;
  ownerId?: string;
  tables: TableParityResult[];
}

export interface PostgresParityOptions {
  source: ISqlDatabase;
  target: ISqlDatabase;
  ownerId?: string;
}

function assertIdentifier(name: string): void {
  if (!/^[a-z_][a-z0-9_]*$/i.test(name)) {
    throw new Error(`Invalid SQL identifier: ${name}`);
  }
}

function buildCountSql(spec: BackfillTableSpec, ownerId?: string): { sql: string; params: unknown[] } {
  assertIdentifier(spec.table);
  let sql = `SELECT COUNT(*) AS count FROM ${spec.table}`;
  const params: unknown[] = [];

  if (ownerId && spec.ownerWhereClause) {
    sql += ` WHERE ${spec.ownerWhereClause}`;
    params.push(ownerId);
  }

  return { sql, params };
}

async function countRows(
  db: ISqlDatabase,
  spec: BackfillTableSpec,
  ownerId?: string,
): Promise<number> {
  const { sql, params } = buildCountSql(spec, ownerId);
  const rows = await db.query<{ count: number | string }>(sql, params);
  const raw = rows[0]?.count ?? 0;
  return typeof raw === 'string' ? Number.parseInt(raw, 10) : Number(raw);
}

export async function verifyPostgresParity(
  options: PostgresParityOptions,
): Promise<PostgresParityResult> {
  const tables: TableParityResult[] = [];

  for (const spec of METADATA_BACKFILL_TABLES) {
    const sourceCount = await countRows(options.source, spec, options.ownerId);
    const targetCount = await countRows(options.target, spec, options.ownerId);
    tables.push({
      table: spec.table,
      sourceCount,
      targetCount,
      match: sourceCount === targetCount,
    });
  }

  return {
    ok: tables.every((row) => row.match),
    ownerId: options.ownerId,
    tables,
  };
}
