import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import type { MemoryRow } from '../../src/types/memory.js';
import type { IdentityRow } from '../../src/auth/auth.types.js';

interface ClientRow {
  id: string;
  name: string;
  type: string;
  description: string;
  metadata: string;
  owner_id: string;
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

    if (
      normalizedSql === 'BEGIN IMMEDIATE' ||
      normalizedSql === 'COMMIT' ||
      normalizedSql === 'ROLLBACK'
    ) {
      if (normalizedSql === 'BEGIN IMMEDIATE') this.inTransaction = true;
      if (normalizedSql === 'COMMIT' || normalizedSql === 'ROLLBACK') this.inTransaction = false;
      return { results: [], success: true, meta: { changes: 0 } };
    }

    if (normalizedSql.includes('SELECT 1 AS OK')) {
      return { results: [{ ok: 1 }], success: true };
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
        owner_id: (params[5] as string) ?? '',
        created_at: params[6] as string,
        active: 1,
      };
      this.clients.set(row.id, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('SELECT * FROM CLIENTS WHERE OWNER_ID = ?')) {
      const ownerId = params[0] as string;
      const rows = [...this.clients.values()]
        .filter((c) => c.owner_id === ownerId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('SELECT * FROM CLIENTS WHERE ID = ?')) {
      const id = params[0] as string;
      const row = this.clients.get(id);
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.includes('UPDATE CLIENTS')) {
      const id = params[5] as string;
      const ownerId = params[6] as string;
      const row = this.clients.get(id);
      if (row && row.owner_id === ownerId) {
        row.name = params[0] as string;
        row.type = params[1] as string;
        row.description = params[2] as string;
        row.metadata = params[3] as string;
        row.active = params[4] as number;
        this.clients.set(id, row);
      }
      return { results: [], success: true, meta: { changes: row ? 1 : 0 } };
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

    if (normalizedSql.startsWith('INSERT INTO MEMORIES')) {
      const row: MemoryRow = {
        id: params[0] as string,
        title: params[1] as string,
        project: params[2] as string,
        content: params[3] as string,
        summary: params[4] as string,
        tags: params[5] as string,
        favorite: params[6] as number,
        archived: params[7] as number,
        owner_id: (params[8] as string) ?? '',
        created_at: params[9] as string,
        updated_at: params[10] as string,
      };
      this.memories.set(row.id, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('UPDATE MEMORIES')) {
      let id: string;
      let ownerId: string | undefined;

      if (
        params.length === 4 &&
        (normalizedSql.includes('FAVORITE = ?') || normalizedSql.includes('ARCHIVED = ?'))
      ) {
        id = params[2] as string;
        ownerId = params[3] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        if (normalizedSql.includes('FAVORITE = ?')) {
          existing.favorite = params[0] as number;
        } else {
          existing.archived = params[0] as number;
        }
        existing.updated_at = params[1] as string;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      if (params.length === 10) {
        id = params[8] as string;
        ownerId = params[9] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.title = params[0] as string;
        existing.project = params[1] as string;
        existing.content = params[2] as string;
        existing.summary = params[3] as string;
        existing.tags = params[4] as string;
        existing.favorite = params[5] as number;
        existing.archived = params[6] as number;
        existing.updated_at = params[7] as string;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      return { results: [], success: true, meta: { changes: 0 } };
    }

    if (normalizedSql.startsWith('DELETE FROM MEMORIES WHERE ID = ? AND OWNER_ID = ?')) {
      const id = params[0] as string;
      const ownerId = params[1] as string;
      const row = this.memories.get(id);
      const existed = row?.owner_id === ownerId;
      if (existed) this.memories.delete(id);
      return { results: [], success: true, meta: { changes: existed ? 1 : 0 } };
    }

    if (normalizedSql.startsWith('DELETE FROM MEMORIES WHERE ID')) {
      const id = params[0] as string;
      const existed = this.memories.has(id);
      this.memories.delete(id);
      return { results: [], success: true, meta: { changes: existed ? 1 : 0 } };
    }

    if (normalizedSql.startsWith('DELETE FROM MEMORIES WHERE OWNER_ID = ?')) {
      const ownerId = params[0] as string;
      let count = 0;
      for (const [id, row] of this.memories) {
        if (row.owner_id === ownerId) {
          this.memories.delete(id);
          count++;
        }
      }
      return { results: [], success: true, meta: { changes: count } };
    }

    if (normalizedSql.startsWith('DELETE FROM MEMORIES')) {
      const count = this.memories.size;
      this.memories.clear();
      return { results: [], success: true, meta: { changes: count } };
    }

    if (normalizedSql.includes('SELECT * FROM MEMORIES WHERE ID = ? AND OWNER_ID = ?')) {
      const id = params[0] as string;
      const ownerId = params[1] as string;
      const row = this.memories.get(id);
      return { results: row && row.owner_id === ownerId ? [row] : [], success: true };
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
    if (
      normalizedSql.includes('SELECT * FROM MEMORIES WHERE OWNER_ID = ? ORDER BY CREATED_AT ASC')
    ) {
      const ownerId = params[0] as string;
      const rows = [...this.memories.values()]
        .filter((m) => m.owner_id === ownerId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('SELECT DISTINCT PROJECT')) {
      const ownerId = params[0] as string;
      const projects = [
        ...new Set(
          [...this.memories.values()]
            .filter((m) => m.owner_id === ownerId && m.project !== '' && m.archived === 0)
            .map((m) => m.project),
        ),
      ].sort();
      return { results: projects.map((p) => ({ project: p })), success: true };
    }

    if (normalizedSql.includes('SELECT TAGS FROM MEMORIES WHERE OWNER_ID = ?')) {
      const ownerId = params[0] as string;
      const rows = [...this.memories.values()]
        .filter((m) => m.owner_id === ownerId && m.archived === 0)
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
    let paramIndex = 0;

    const nextParam = (): unknown => params[paramIndex++];

    if (upperSql.includes('OWNER_ID = ?')) {
      const ownerId = nextParam() as string;
      results = results.filter((m) => m.owner_id === ownerId);
    }

    if (upperSql.includes('(TITLE LIKE ? OR CONTENT LIKE ?')) {
      const keyword = (nextParam() as string).slice(1, -1).toLowerCase();
      nextParam();
      nextParam();
      nextParam();
      results = results.filter(
        (m) =>
          m.title.toLowerCase().includes(keyword) ||
          m.content.toLowerCase().includes(keyword) ||
          m.summary.toLowerCase().includes(keyword) ||
          m.project.toLowerCase().includes(keyword),
      );
    }

    if (upperSql.includes('TAGS LIKE ?')) {
      const tagPattern = nextParam() as string;
      const tag = tagPattern.slice(2, -2);
      results = results.filter((m) => m.tags.includes(`"${tag}"`) || m.tags.includes(tag));
    }

    if (upperSql.includes('PROJECT = ?') && !upperSql.includes('LIKE')) {
      const project = nextParam() as string;
      results = results.filter((m) => m.project === project);
    }

    if (upperSql.includes('FAVORITE = ?')) {
      const favorite = nextParam() as number;
      results = results.filter((m) => m.favorite === favorite);
    }

    if (upperSql.includes('ARCHIVED = ?')) {
      const archived = nextParam() as number;
      results = results.filter((m) => m.archived === archived);
    } else if (upperSql.includes('ARCHIVED = 0')) {
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
