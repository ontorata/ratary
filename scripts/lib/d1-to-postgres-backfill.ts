import type { ISqlDatabase } from '../../src/ports/sql/isql-database.port.js';

export interface BackfillTableSpec {
  table: string;
  primaryKey: string;
  columns: readonly string[];
  /** Optional owner scope — single `?` placeholder for owner id */
  ownerWhereClause?: string;
}

/** FK-safe metadata table order (ADR-018). */
export const METADATA_BACKFILL_TABLES: readonly BackfillTableSpec[] = [
  {
    table: 'organizations',
    primaryKey: 'id',
    columns: ['id', 'owner_id', 'name', 'slug', 'created_at'],
    ownerWhereClause: 'owner_id = ?',
  },
  {
    table: 'workspaces',
    primaryKey: 'id',
    columns: ['id', 'owner_id', 'name', 'slug', 'created_at', 'organization_id'],
    ownerWhereClause: 'owner_id = ?',
  },
  {
    table: 'clients',
    primaryKey: 'id',
    columns: ['id', 'name', 'type', 'description', 'metadata', 'owner_id', 'created_at', 'active'],
    ownerWhereClause: 'owner_id = ?',
  },
  {
    table: 'identities',
    primaryKey: 'id',
    columns: [
      'id',
      'type',
      'name',
      'secret_hash',
      'owner_id',
      'description',
      'metadata',
      'client_id',
      'created_by',
      'created_at',
      'last_used_at',
      'expires_at',
      'revoked_at',
      'active',
    ],
    ownerWhereClause: 'owner_id = ?',
  },
  {
    table: 'agents',
    primaryKey: 'id',
    columns: [
      'id',
      'workspace_id',
      'owner_id',
      'name',
      'client_id',
      'agent_type',
      'metadata',
      'created_at',
      'active',
    ],
    ownerWhereClause: 'owner_id = ?',
  },
  {
    table: 'memories',
    primaryKey: 'id',
    columns: [
      'id',
      'title',
      'project',
      'content',
      'summary',
      'tags',
      'favorite',
      'archived',
      'owner_id',
      'codename',
      'slug',
      'keywords',
      'category',
      'memory_type',
      'importance',
      'language',
      'notes',
      'project_id',
      'level',
      'last_accessed',
      'access_count',
      'embedding_id',
      'object_key',
      'semantic_hash',
      'workspace_id',
      'last_modified_by_agent_id',
      'created_at',
      'updated_at',
    ],
    ownerWhereClause: 'owner_id = ?',
  },
  {
    table: 'memory_embeddings',
    primaryKey: 'id',
    columns: [
      'id',
      'memory_id',
      'owner_id',
      'model_id',
      'dimensions',
      'vector_json',
      'content_hash',
      'created_at',
      'updated_at',
    ],
    ownerWhereClause: 'owner_id = ?',
  },
  {
    table: 'memory_relations',
    primaryKey: 'id',
    columns: [
      'id',
      'source_memory_id',
      'target_memory_id',
      'relation',
      'owner_id',
      'weight',
      'confidence',
      'created_by',
      'source_type',
      'metadata',
      'created_at',
    ],
    ownerWhereClause: 'owner_id = ?',
  },
  {
    table: 'workspace_memberships',
    primaryKey: 'id',
    columns: ['id', 'organization_id', 'workspace_id', 'identity_id', 'role', 'created_at'],
    ownerWhereClause: 'organization_id IN (SELECT id FROM organizations WHERE owner_id = ?)',
  },
  {
    table: 'audit_logs',
    primaryKey: 'id',
    columns: [
      'id',
      'event',
      'identity_id',
      'owner_id',
      'client_id',
      'resource',
      'resource_id',
      'request_id',
      'ip_address',
      'user_agent',
      'metadata',
      'created_at',
    ],
    ownerWhereClause: 'owner_id = ?',
  },
  {
    table: 'settings',
    primaryKey: 'key',
    columns: ['key', 'value'],
  },
];

export interface TableBackfillStats {
  table: string;
  scanned: number;
  upserted: number;
}

export interface D1ToPostgresBackfillResult {
  dryRun: boolean;
  tables: TableBackfillStats[];
}

export interface D1ToPostgresBackfillOptions {
  source: ISqlDatabase;
  target: ISqlDatabase;
  ownerId?: string;
  batchSize: number;
  dryRun: boolean;
}

function assertIdentifier(name: string): void {
  if (!/^[a-z_][a-z0-9_]*$/i.test(name)) {
    throw new Error(`Invalid SQL identifier: ${name}`);
  }
}

function buildUpsertSql(spec: BackfillTableSpec): string {
  assertIdentifier(spec.table);
  for (const column of spec.columns) {
    assertIdentifier(column);
  }
  assertIdentifier(spec.primaryKey);

  const columnList = spec.columns.join(', ');
  const placeholders = spec.columns.map(() => '?').join(', ');
  const updates = spec.columns
    .filter((column) => column !== spec.primaryKey)
    .map((column) => `${column} = EXCLUDED.${column}`)
    .join(', ');

  return `INSERT INTO ${spec.table} (${columnList}) VALUES (${placeholders})
    ON CONFLICT (${spec.primaryKey}) DO UPDATE SET ${updates}`;
}

const MEMORIES_SPEC = METADATA_BACKFILL_TABLES.find((entry) => entry.table === 'memories')!;

function buildMemoriesUpsertSql(conflict: 'id' | 'owner_codename' | 'owner_slug'): string {
  const spec = MEMORIES_SPEC;
  const columnList = spec.columns.join(', ');
  const placeholders = spec.columns.map(() => '?').join(', ');
  const updates = spec.columns
    .filter((column) => column !== 'id')
    .map((column) => `${column} = EXCLUDED.${column}`)
    .join(', ');

  const insert = `INSERT INTO memories (${columnList}) VALUES (${placeholders})`;
  if (conflict === 'owner_codename') {
    return `${insert} ON CONFLICT (owner_id, codename) WHERE codename IS NOT NULL DO UPDATE SET ${updates} RETURNING id`;
  }
  if (conflict === 'owner_slug') {
    return `${insert} ON CONFLICT (owner_id, slug) WHERE slug IS NOT NULL DO UPDATE SET ${updates} RETURNING id`;
  }
  return `${insert} ON CONFLICT (id) DO UPDATE SET ${updates} RETURNING id`;
}

function hasNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

async function upsertMemoryRow(
  target: ISqlDatabase,
  row: Record<string, unknown>,
): Promise<string> {
  const values = MEMORIES_SPEC.columns.map((column) => row[column] ?? null);
  const sql = hasNonEmptyString(row.codename)
    ? buildMemoriesUpsertSql('owner_codename')
    : hasNonEmptyString(row.slug)
      ? buildMemoriesUpsertSql('owner_slug')
      : buildMemoriesUpsertSql('id');

  const result = await target.execute(sql, values);
  const returnedId = result.results?.[0]?.id;
  return returnedId != null ? String(returnedId) : String(row.id);
}

function remapMemoryForeignKeys(
  row: Record<string, unknown>,
  memoryIdMap: Map<string, string>,
  spec: BackfillTableSpec,
): Record<string, unknown> {
  if (memoryIdMap.size === 0) {
    return row;
  }

  if (spec.table === 'memory_embeddings') {
    const memoryId = row.memory_id;
    if (memoryId == null) {
      return row;
    }
    const mapped = memoryIdMap.get(String(memoryId));
    return mapped ? { ...row, memory_id: mapped } : row;
  }

  if (spec.table === 'memory_relations') {
    let next = row;
    for (const column of ['source_memory_id', 'target_memory_id'] as const) {
      const raw = next[column];
      if (raw == null) {
        continue;
      }
      const mapped = memoryIdMap.get(String(raw));
      if (mapped) {
        next = { ...next, [column]: mapped };
      }
    }
    return next;
  }

  return row;
}

function buildSelectSql(
  spec: BackfillTableSpec,
  ownerId?: string,
): { sql: string; params: unknown[] } {
  const columnList = spec.columns.join(', ');
  let sql = `SELECT ${columnList} FROM ${spec.table}`;
  const params: unknown[] = [];

  if (ownerId && spec.ownerWhereClause) {
    sql += ` WHERE ${spec.ownerWhereClause}`;
    params.push(ownerId);
  }

  sql += ` ORDER BY ${spec.primaryKey} LIMIT ? OFFSET ?`;
  return { sql, params };
}

async function fetchBatch(
  source: ISqlDatabase,
  spec: BackfillTableSpec,
  ownerId: string | undefined,
  batchSize: number,
  offset: number,
): Promise<Record<string, unknown>[]> {
  const { sql, params } = buildSelectSql(spec, ownerId);
  params.push(batchSize, offset);
  return source.query<Record<string, unknown>>(sql, params);
}

async function backfillMemoriesTable(
  source: ISqlDatabase,
  target: ISqlDatabase,
  options: Pick<D1ToPostgresBackfillOptions, 'ownerId' | 'batchSize' | 'dryRun'>,
): Promise<{ stats: TableBackfillStats; memoryIdMap: Map<string, string> }> {
  const stats: TableBackfillStats = { table: 'memories', scanned: 0, upserted: 0 };
  const memoryIdMap = new Map<string, string>();
  let offset = 0;

  while (true) {
    const rows = await fetchBatch(
      source,
      MEMORIES_SPEC,
      options.ownerId,
      options.batchSize,
      offset,
    );
    if (rows.length === 0) {
      break;
    }

    for (const row of rows) {
      stats.scanned++;
      const sourceId = String(row.id);
      if (options.dryRun) {
        memoryIdMap.set(sourceId, sourceId);
        continue;
      }

      const targetId = await upsertMemoryRow(target, row);
      memoryIdMap.set(sourceId, targetId);
      stats.upserted++;
    }

    offset += rows.length;
    if (rows.length < options.batchSize) {
      break;
    }
  }

  return { stats, memoryIdMap };
}

async function backfillTable(
  source: ISqlDatabase,
  target: ISqlDatabase,
  spec: BackfillTableSpec,
  options: Pick<D1ToPostgresBackfillOptions, 'ownerId' | 'batchSize' | 'dryRun'>,
  memoryIdMap: Map<string, string> = new Map(),
): Promise<TableBackfillStats> {
  const stats: TableBackfillStats = { table: spec.table, scanned: 0, upserted: 0 };
  const upsertSql = buildUpsertSql(spec);
  let offset = 0;

  while (true) {
    const rows = await fetchBatch(source, spec, options.ownerId, options.batchSize, offset);
    if (rows.length === 0) {
      break;
    }

    for (const row of rows) {
      stats.scanned++;
      if (options.dryRun) {
        continue;
      }

      const mappedRow = remapMemoryForeignKeys(row, memoryIdMap, spec);
      const values = spec.columns.map((column) => mappedRow[column] ?? null);
      await target.execute(upsertSql, values);
      stats.upserted++;
    }

    offset += rows.length;
    if (rows.length < options.batchSize) {
      break;
    }
  }

  return stats;
}

export async function backfillD1ToPostgres(
  options: D1ToPostgresBackfillOptions,
): Promise<D1ToPostgresBackfillResult> {
  const tables: TableBackfillStats[] = [];
  let memoryIdMap = new Map<string, string>();

  for (const spec of METADATA_BACKFILL_TABLES) {
    if (spec.table === 'memories') {
      const result = await backfillMemoriesTable(options.source, options.target, options);
      memoryIdMap = result.memoryIdMap;
      tables.push(result.stats);
      continue;
    }

    tables.push(await backfillTable(options.source, options.target, spec, options, memoryIdMap));
  }

  return {
    dryRun: options.dryRun,
    tables,
  };
}
