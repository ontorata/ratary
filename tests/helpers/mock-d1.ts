import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import type { MemoryRow } from '../../src/types/memory.js';
import type { IdentityRow } from '../../src/auth/auth.types.js';

interface ClientRow {
  id: string;
  name: string;
  type: string;
  description: string;
  metadata: string;
  created_at: string;
  active: number;
}

export class MockD1Client implements D1Client {
  private memories: Map<string, MemoryRow> = new Map();
  private identities: Map<string, IdentityRow> = new Map();
  private identityByHash: Map<string, string> = new Map();
  private clients: Map<string, ClientRow> = new Map();
  private settings: Map<string, string> = new Map();
  private auditLogs: unknown[] = [];
  private inTransaction = false;
  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.execute(sql, params);
    return result.results as T[];
  }

  async execute(sql: string, params: unknown[] = []): Promise<D1QueryResult> {
    const normalizedSql = sql.trim().toUpperCase();

    if (normalizedSql.startsWith('CREATE TABLE') || normalizedSql.startsWith('CREATE INDEX')) {
      return { results: [], success: true, meta: { changes: 0 } };
    }

    if (normalizedSql.startsWith('PRAGMA TABLE_INFO')) {
      const columns = [
        { name: 'id' },
        { name: 'title' },
        { name: 'project' },
        { name: 'content' },
        { name: 'summary' },
        { name: 'tags' },
        { name: 'favorite' },
        { name: 'archived' },
        { name: 'owner_id' },
        { name: 'created_at' },
        { name: 'updated_at' },
      ];
      return { results: columns, success: true };
    }

    if (normalizedSql.startsWith('ALTER TABLE')) {
      return { results: [], success: true, meta: { changes: 0 } };
    }

    if (normalizedSql === 'BEGIN IMMEDIATE' || normalizedSql === 'COMMIT' || normalizedSql === 'ROLLBACK') {
      if (normalizedSql === 'BEGIN IMMEDIATE') this.inTransaction = true;
      if (normalizedSql === 'COMMIT' || normalizedSql === 'ROLLBACK') this.inTransaction = false;
      return { results: [], success: true, meta: { changes: 0 } };
    }

    if (normalizedSql.startsWith('INSERT INTO IDENTITIES')) {
      const expiresAt = params.length >= 11 ? (params[10] as string | null) : null;
      const createdAt = params[9] as string;
      const row: IdentityRow = {
        id: params[0] as string,
        type: params[1] as string,
        name: params[2] as string,
        secret_hash: params[3] as string | null,
        owner_id: params[4] as string,
        description: params[5] as string,
        metadata: params[6] as string,
        client_id: params[7] as string | null,
        created_by: params[8] as string | null,
        created_at: createdAt,
        last_used_at: null,
        expires_at: expiresAt,
        revoked_at: null,
        active: 1,
      };
      this.identities.set(row.id, row);
      if (row.secret_hash) this.identityByHash.set(row.secret_hash, row.id);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO CLIENTS')) {
      const row: ClientRow = {
        id: params[0] as string,
        name: params[1] as string,
        type: params[2] as string,
        description: params[3] as string,
        metadata: params[4] as string,
        created_at: params[5] as string,
        active: (params[6] as number | undefined) ?? 1,
      };
      this.clients.set(row.id, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO SETTINGS')) {
      const key = params[0] as string;
      const value = params[1] as string;
      this.settings.set(key, value);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO AUDIT_LOGS')) {
      this.auditLogs.push(params);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('SELECT * FROM IDENTITIES WHERE ID = ?')) {
      const id = params[0] as string;
      const row = this.identities.get(id);
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.includes('SELECT * FROM IDENTITIES WHERE SECRET_HASH = ?')) {
      const hash = params[0] as string;
      const id = this.identityByHash.get(hash);
      const row = id ? this.identities.get(id) : undefined;
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.includes('SELECT * FROM IDENTITIES WHERE OWNER_ID = ?')) {
      const ownerId = params[0] as string;
      const rows = [...this.identities.values()].filter((i) => i.owner_id === ownerId);
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('SELECT * FROM IDENTITIES ORDER BY')) {
      const rows = [...this.identities.values()].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      );
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('SELECT COUNT(*) AS COUNT FROM IDENTITIES')) {
      return { results: [{ count: this.identities.size }], success: true };
    }

    if (normalizedSql.includes('UPDATE IDENTITIES SET LAST_USED_AT')) {
      const id = params[1] as string;
      const row = this.identities.get(id);
      if (row) {
        row.last_used_at = params[0] as string;
        this.identities.set(id, row);
      }
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('UPDATE IDENTITIES SET ACTIVE = 0')) {
      const id = params[1] as string;
      const row = this.identities.get(id);
      if (row) {
        row.active = 0;
        row.revoked_at = params[0] as string;
        this.identities.set(id, row);
      }
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('UPDATE IDENTITIES SET SECRET_HASH = ?')) {
      const id = params[1] as string;
      const row = this.identities.get(id);
      if (row) {
        if (row.secret_hash) this.identityByHash.delete(row.secret_hash);
        row.secret_hash = params[0] as string;
        row.last_used_at = null;
        this.identities.set(id, row);
        if (row.secret_hash) this.identityByHash.set(row.secret_hash, id);
      }
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('SELECT VALUE FROM SETTINGS WHERE KEY = ?')) {
      const value = this.settings.get(params[0] as string);
      return { results: value !== undefined ? [{ value }] : [], success: true };
    }

    if (normalizedSql.startsWith('INSERT INTO MEMORIES')) {      const row: MemoryRow = {
        id: params[0] as string,
        title: params[1] as string,
        project: params[2] as string,
        content: params[3] as string,
        summary: params[4] as string,
        tags: params[5] as string,
        favorite: params[6] as number,
        archived: params[7] as number,
        created_at: params[8] as string,
        updated_at: params[9] as string,
      };
      this.memories.set(row.id, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('UPDATE MEMORIES')) {
      const id = params[params.length - 1] as string;
      const existing = this.memories.get(id);
      if (!existing) {
        return { results: [], success: true, meta: { changes: 0 } };
      }

      if (params.length === 3 && normalizedSql.includes('FAVORITE = ?')) {
        existing.favorite = params[0] as number;
        existing.updated_at = params[1] as string;
      } else if (params.length === 3 && normalizedSql.includes('ARCHIVED = ?')) {
        existing.archived = params[0] as number;
        existing.updated_at = params[1] as string;
      } else if (params.length === 9) {
        existing.title = params[0] as string;
        existing.project = params[1] as string;
        existing.content = params[2] as string;
        existing.summary = params[3] as string;
        existing.tags = params[4] as string;
        existing.favorite = params[5] as number;
        existing.archived = params[6] as number;
        existing.updated_at = params[7] as string;
      }

      this.memories.set(id, existing);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('DELETE FROM MEMORIES WHERE ID')) {
      const id = params[0] as string;
      const existed = this.memories.has(id);
      this.memories.delete(id);
      return { results: [], success: true, meta: { changes: existed ? 1 : 0 } };
    }

    if (normalizedSql.startsWith('DELETE FROM MEMORIES')) {
      const count = this.memories.size;
      this.memories.clear();
      return { results: [], success: true, meta: { changes: count } };
    }

    if (normalizedSql.includes('SELECT * FROM MEMORIES WHERE ID = ?')) {
      const id = params[0] as string;
      const row = this.memories.get(id);
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.includes('SELECT COUNT(*)')) {
      if (normalizedSql.includes('FROM IDENTITIES')) {
        return { results: [{ count: this.identities.size }], success: true };
      }
      const filtered = this.filterMemories(sql, params);
      return { results: [{ count: filtered.length }], success: true };
    }
    if (normalizedSql.includes('SELECT DISTINCT PROJECT')) {
      const projects = [
        ...new Set(
          [...this.memories.values()]
            .filter((m) => m.project !== '' && m.archived === 0)
            .map((m) => m.project),
        ),
      ].sort();
      return { results: projects.map((p) => ({ project: p })), success: true };
    }

    if (normalizedSql.includes('SELECT TAGS FROM MEMORIES')) {
      const rows = [...this.memories.values()]
        .filter((m) => m.archived === 0)
        .map((m) => ({ tags: m.tags }));
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('SELECT * FROM MEMORIES')) {
      const filtered = this.filterMemories(sql, params);
      const limit = params[params.length - 2] as number | undefined;
      const offset = params[params.length - 1] as number | undefined;

      let results = filtered;
      if (typeof limit === 'number' && typeof offset === 'number') {
        results = filtered.slice(offset, offset + limit);
      }

      results.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      return { results, success: true };
    }

    return { results: [], success: true };
  }

  private filterMemories(sql: string, params: unknown[]): MemoryRow[] {
    let results = [...this.memories.values()];
    const upperSql = sql.toUpperCase();

    const tagLikeParam = params.find(
      (p): p is string => typeof p === 'string' && p.startsWith('%"') && p.endsWith('"%'),
    );
    if (tagLikeParam) {
      const tag = tagLikeParam.slice(2, -2);
      results = results.filter((m) => m.tags.includes(`"${tag}"`) || m.tags.includes(tag));
    }

    const textLikePatterns = params.filter(
      (p): p is string =>
        typeof p === 'string' && p.startsWith('%') && p.endsWith('%') && !p.startsWith('%"'),
    );
    if (upperSql.includes('LIKE ?') && textLikePatterns.length > 0) {
      const keyword = textLikePatterns[0].slice(1, -1).toLowerCase();
      results = results.filter(
        (m) =>
          m.title.toLowerCase().includes(keyword) ||
          m.content.toLowerCase().includes(keyword) ||
          m.summary.toLowerCase().includes(keyword) ||
          m.project.toLowerCase().includes(keyword),
      );
    }

    const stringParams = params.filter(
      (p): p is string => typeof p === 'string' && !p.startsWith('%'),
    );
    for (const value of stringParams) {
      if (upperSql.includes('PROJECT = ?')) {
        results = results.filter((m) => m.project === value);
      }
    }

    const filterParams = params.slice(0, -2);
    const numericParams = filterParams.filter(
      (p): p is number => typeof p === 'number' && (p === 0 || p === 1),
    );
    for (const value of numericParams) {
      if (upperSql.includes('FAVORITE = ?')) {
        results = results.filter((m) => m.favorite === value);
      }
      if (upperSql.includes('ARCHIVED = ?')) {
        results = results.filter((m) => m.archived === value);
      }
    }

    if (upperSql.includes('ARCHIVED = 0') && !upperSql.includes('ARCHIVED = ?')) {
      results = results.filter((m) => m.archived === 0);
    }

    return results;
  }

  seed(data: MemoryRow[]): void {
    for (const row of data) {
      this.memories.set(row.id, row);
    }
  }

  clear(): void {
    this.memories.clear();
    this.identities.clear();
    this.identityByHash.clear();
    this.clients.clear();
    this.settings.clear();
    this.auditLogs = [];
  }

  getAuditLogCount(): number {
    return this.auditLogs.length;
  }
}