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
  private relations: Map<string, Record<string, unknown>> = new Map();
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
        { name: 'codename' },
        { name: 'slug' },
        { name: 'keywords' },
        { name: 'category' },
        { name: 'memory_type' },
        { name: 'importance' },
        { name: 'language' },
        { name: 'notes' },
        { name: 'project_id' },
        { name: 'level' },
        { name: 'last_accessed' },
        { name: 'access_count' },
        { name: 'embedding_id' },
        { name: 'object_key' },
        { name: 'semantic_hash' },
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
        codename: (params[11] as string | null | undefined) ?? null,
        slug: (params[12] as string | null | undefined) ?? null,
        keywords: (params[13] as string | undefined) ?? '[]',
        category: (params[14] as string | undefined) ?? '',
        memory_type: (params[15] as string | undefined) ?? 'note',
        importance: (params[16] as number | undefined) ?? 50,
        language: (params[17] as string | undefined) ?? 'id',
        notes: (params[18] as string | undefined) ?? '',
        project_id: (params[19] as string | undefined) ?? '',
        level: (params[20] as string | undefined) ?? 'note',
        last_accessed: (params[21] as string | null | undefined) ?? null,
        access_count: (params[22] as number | undefined) ?? 0,
        embedding_id: (params[23] as string | null | undefined) ?? null,
        object_key: (params[24] as string | null | undefined) ?? null,
        semantic_hash: (params[25] as string | null | undefined) ?? null,
      };
      this.memories.set(row.id, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO MEMORY_RELATIONS')) {
      const id = params[0] as string;
      this.relations.set(id, {
        id,
        source_memory_id: params[1],
        target_memory_id: params[2],
        relation: params[3],
        owner_id: params[4],
        weight: params[5],
        confidence: params[6],
        created_by: params[7],
        source_type: params[8],
        metadata: params[9],
        created_at: params[10],
      });
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('UPDATE MEMORIES')) {
      if (normalizedSql.includes('LAST_ACCESSED = ?') && normalizedSql.includes('ACCESS_COUNT = ACCESS_COUNT + 1')) {
        const lastAccessed = params[0] as string;
        const updatedAt = params[1] as string;
        const id = params[2] as string;
        const ownerId = params[3] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.last_accessed = lastAccessed;
        existing.access_count = (existing.access_count ?? 0) + 1;
        existing.updated_at = updatedAt;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      if (normalizedSql.includes('IMPORTANCE = ?') && params.length === 4) {
        const importance = params[0] as number;
        const updatedAt = params[1] as string;
        const id = params[2] as string;
        const ownerId = params[3] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.importance = importance;
        existing.updated_at = updatedAt;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      if (
        normalizedSql.includes('PROJECT_ID = ?') &&
        normalizedSql.includes('SEMANTIC_HASH = ?') &&
        params.length === 6
      ) {
        const projectId = params[0] as string;
        const level = params[1] as string;
        const semanticHash = params[2] as string;
        const updatedAt = params[3] as string;
        const id = params[4] as string;
        const ownerId = params[5] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.project_id = projectId;
        existing.level = level;
        existing.semantic_hash = semanticHash;
        existing.updated_at = updatedAt;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

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

      if (params.length >= 19) {
        id = params[17] as string;
        ownerId = params[18] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.title = params[0] as string;
        existing.project = params[1] as string;
        existing.content = params[2] as string;
        existing.summary = params[3] as string;
        existing.tags = params[4] as string;
        existing.keywords = params[5] as string;
        existing.category = params[6] as string;
        existing.memory_type = params[7] as string;
        existing.importance = params[8] as number;
        existing.language = params[9] as string;
        existing.notes = params[10] as string;
        existing.slug = params[11] as string | null;
        existing.project_id = params[12] as string;
        existing.level = params[13] as string;
        existing.favorite = params[14] as number;
        existing.archived = params[15] as number;
        existing.updated_at = params[16] as string;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      if (params.length >= 17) {
        id = params[15] as string;
        ownerId = params[16] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.title = params[0] as string;
        existing.project = params[1] as string;
        existing.content = params[2] as string;
        existing.summary = params[3] as string;
        existing.tags = params[4] as string;
        existing.keywords = params[5] as string;
        existing.category = params[6] as string;
        existing.memory_type = params[7] as string;
        existing.importance = params[8] as number;
        existing.language = params[9] as string;
        existing.notes = params[10] as string;
        existing.slug = params[11] as string | null;
        existing.favorite = params[12] as number;
        existing.archived = params[13] as number;
        existing.updated_at = params[14] as string;
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

    if (normalizedSql.includes('SELECT * FROM MEMORIES WHERE OWNER_ID = ? AND CODENAME = ?')) {
      const ownerId = params[0] as string;
      const codename = params[1] as string;
      const row = [...this.memories.values()].find(
        (m) => m.owner_id === ownerId && m.codename === codename,
      );
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.includes('SELECT * FROM MEMORIES WHERE OWNER_ID = ? AND SLUG = ?')) {
      const ownerId = params[0] as string;
      const slug = params[1] as string;
      const row = [...this.memories.values()].find(
        (m) => m.owner_id === ownerId && m.slug === slug,
      );
      return { results: row ? [row] : [], success: true };
    }

    if (
      normalizedSql.includes('SELECT CODENAME FROM MEMORIES') &&
      normalizedSql.includes('CODENAME LIKE ?')
    ) {
      const ownerId = params[0] as string;
      const pattern = (params[1] as string).replace(/%/g, '');
      const prefix = pattern.replace(/-$/, '');
      const rows = [...this.memories.values()]
        .filter((m) => m.owner_id === ownerId && (m.codename ?? '').startsWith(prefix))
        .sort((a, b) => (b.codename ?? '').localeCompare(a.codename ?? ''))
        .slice(0, 1)
        .map((m) => ({ codename: m.codename }));
      return { results: rows, success: true };
    }

    if (
      normalizedSql.includes('SELECT COUNT(*) AS COUNT FROM MEMORIES') &&
      normalizedSql.includes('SLUG = ?')
    ) {
      const ownerId = params[0] as string;
      const slug = params[1] as string;
      const count = [...this.memories.values()].filter(
        (m) => m.owner_id === ownerId && m.slug === slug,
      ).length;
      return { results: [{ count }], success: true };
    }

    if (normalizedSql.includes('SELECT DISTINCT CATEGORY')) {
      const ownerId = params[0] as string;
      const categories = [
        ...new Set(
          [...this.memories.values()]
            .filter((m) => m.owner_id === ownerId && m.category !== '' && m.archived === 0)
            .map((m) => m.category ?? ''),
        ),
      ].sort();
      return { results: categories.map((c) => ({ category: c })), success: true };
    }

    if (normalizedSql.includes('SELECT * FROM MEMORY_RELATIONS WHERE ID = ? AND OWNER_ID = ?')) {
      const id = params[0] as string;
      const ownerId = params[1] as string;
      const row = this.relations.get(id);
      return {
        results: row && row.owner_id === ownerId ? [row] : [],
        success: true,
      };
    }

    if (normalizedSql.includes('SELECT * FROM MEMORY_RELATIONS')) {
      const ownerId = params[0] as string;
      const memoryId = params[1] as string;
      const rows = [...this.relations.values()].filter(
        (r) =>
          r.owner_id === ownerId &&
          (r.source_memory_id === memoryId || r.target_memory_id === memoryId),
      );
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('FROM MEMORY_RELATIONS') && normalizedSql.includes('COUNT(*)')) {
      const ownerId = params[0] as string;
      const sourceId = params[1] as string;
      const targetId = params[2] as string;
      const relation = params[3] as string;
      const count = [...this.relations.values()].filter(
        (r) =>
          r.owner_id === ownerId &&
          r.source_memory_id === sourceId &&
          r.target_memory_id === targetId &&
          r.relation === relation,
      ).length;
      return { results: [{ count }], success: true };
    }

    if (normalizedSql.startsWith('DELETE FROM MEMORY_RELATIONS')) {
      const id = params[0] as string;
      const ownerId = params[1] as string;
      const row = this.relations.get(id);
      const existed = row?.owner_id === ownerId;
      if (existed) this.relations.delete(id);
      return { results: [], success: true, meta: { changes: existed ? 1 : 0 } };
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

      if (normalizedSql.includes('ORDER BY IMPORTANCE DESC, UPDATED_AT DESC')) {
        const limit = params[params.length - 1] as number;
        const sorted = filtered
          .sort((a, b) => {
            const imp = (b.importance ?? 50) - (a.importance ?? 50);
            if (imp !== 0) return imp;
            return b.updated_at.localeCompare(a.updated_at);
          })
          .slice(0, limit);
        return { results: sorted, success: true };
      }

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
    const queryParams = [...params];
    if (upperSql.includes('OFFSET ?') && typeof queryParams[queryParams.length - 1] === 'number') {
      queryParams.pop();
      if (typeof queryParams[queryParams.length - 1] === 'number') {
        queryParams.pop();
      }
    } else if (upperSql.includes('LIMIT ?') && typeof queryParams[queryParams.length - 1] === 'number') {
      queryParams.pop();
    }

    let paramIndex = 0;
    const nextParam = (): unknown => queryParams[paramIndex++];

    type FilterHandler = { position: number; run: () => void };
    const handlers: FilterHandler[] = [];
    const pos = (needle: string): number => upperSql.indexOf(needle);

    if (upperSql.includes('OWNER_ID = ?')) {
      handlers.push({
        position: pos('OWNER_ID = ?'),
        run: () => {
          const ownerId = nextParam() as string;
          results = results.filter((m) => m.owner_id === ownerId);
        },
      });
    }

    if (upperSql.includes('ARCHIVED = ?')) {
      handlers.push({
        position: pos('ARCHIVED = ?'),
        run: () => {
          const archived = nextParam() as number;
          results = results.filter((m) => m.archived === archived);
        },
      });
    } else if (upperSql.includes('ARCHIVED = 0')) {
      handlers.push({
        position: pos('ARCHIVED = 0'),
        run: () => {
          results = results.filter((m) => m.archived === 0);
        },
      });
    }

    if (upperSql.includes('PROJECT_ID = ?')) {
      handlers.push({
        position: pos('PROJECT_ID = ?'),
        run: () => {
          const projectId = nextParam() as string;
          results = results.filter((m) => (m.project_id ?? '') === projectId);
        },
      });
    }

    if (upperSql.includes('LEVEL IN (')) {
      const levelMatch = upperSql.match(/LEVEL IN \(([^)]+)\)/);
      const levelClause = levelMatch?.[1] ?? '';
      if (levelClause.includes('?')) {
        const count = levelClause.split(',').length;
        handlers.push({
          position: pos('LEVEL IN ('),
          run: () => {
            const levels: string[] = [];
            for (let i = 0; i < count; i++) {
              levels.push(nextParam() as string);
            }
            results = results.filter((m) => levels.includes(m.level ?? 'note'));
          },
        });
      } else if (levelClause.includes("'NOTE'") && levelClause.includes("'RAW'")) {
        handlers.push({
          position: pos('LEVEL IN ('),
          run: () => {
            results = results.filter((m) => {
              const level = m.level ?? 'note';
              return level === 'note' || level === 'raw';
            });
          },
        });
      }
    }

    if (upperSql.includes('IMPORTANCE >= ?')) {
      handlers.push({
        position: pos('IMPORTANCE >= ?'),
        run: () => {
          const importanceMin = nextParam() as number;
          results = results.filter((m) => (m.importance ?? 50) >= importanceMin);
        },
      });
    }

    if (upperSql.includes('ACCESS_COUNT >= ?')) {
      handlers.push({
        position: pos('ACCESS_COUNT >= ?'),
        run: () => {
          const minAccess = nextParam() as number;
          results = results.filter((m) => (m.access_count ?? 0) >= minAccess);
        },
      });
    }

    if (upperSql.includes('UPDATED_AT < ?')) {
      handlers.push({
        position: pos('UPDATED_AT < ?'),
        run: () => {
          const cutoff = nextParam() as string;
          results = results.filter((m) => m.updated_at < cutoff);
        },
      });
    }

    if (upperSql.includes('SEMANTIC_HASH = ?')) {
      handlers.push({
        position: pos('SEMANTIC_HASH = ?'),
        run: () => {
          const semanticHash = nextParam() as string;
          results = results.filter((m) => (m.semantic_hash ?? '') === semanticHash);
        },
      });
    }

    if (upperSql.includes('PROJECT = ?') && !upperSql.includes('PROJECT LIKE')) {
      handlers.push({
        position: pos('PROJECT = ?'),
        run: () => {
          const project = nextParam() as string;
          results = results.filter((m) => m.project === project);
        },
      });
    }

    if (upperSql.includes('CATEGORY = ?')) {
      handlers.push({
        position: pos('CATEGORY = ?'),
        run: () => {
          const category = nextParam() as string;
          results = results.filter((m) => (m.category ?? '') === category);
        },
      });
    }

    if (upperSql.includes('MEMORY_TYPE = ?')) {
      handlers.push({
        position: pos('MEMORY_TYPE = ?'),
        run: () => {
          const memoryType = nextParam() as string;
          results = results.filter((m) => (m.memory_type ?? 'note') === memoryType);
        },
      });
    }

    if (upperSql.includes('FAVORITE = ?')) {
      handlers.push({
        position: pos('FAVORITE = ?'),
        run: () => {
          const favorite = nextParam() as number;
          results = results.filter((m) => m.favorite === favorite);
        },
      });
    }

    if (
      upperSql.includes(
        '(TITLE LIKE ? OR CONTENT LIKE ? OR SUMMARY LIKE ? OR KEYWORDS LIKE ? OR CODENAME LIKE ?)',
      )
    ) {
      handlers.push({
        position: pos('(TITLE LIKE ? OR CONTENT LIKE ? OR SUMMARY LIKE ? OR KEYWORDS LIKE ? OR CODENAME LIKE ?)'),
        run: () => {
          const keyword = (nextParam() as string).slice(1, -1).toLowerCase();
          nextParam();
          nextParam();
          nextParam();
          nextParam();
          results = results.filter(
            (m) =>
              m.title.toLowerCase().includes(keyword) ||
              m.content.toLowerCase().includes(keyword) ||
              m.summary.toLowerCase().includes(keyword) ||
              (m.keywords ?? '').toLowerCase().includes(keyword) ||
              (m.codename ?? '').toLowerCase().includes(keyword),
          );
        },
      });
    } else if (upperSql.includes('(TITLE LIKE ? OR CONTENT LIKE ?')) {
      handlers.push({
        position: pos('(TITLE LIKE ? OR CONTENT LIKE ?'),
        run: () => {
          const keyword = (nextParam() as string).slice(1, -1).toLowerCase();
          nextParam();
          nextParam();
          nextParam();
          nextParam();
          nextParam();
          results = results.filter(
            (m) =>
              m.title.toLowerCase().includes(keyword) ||
              m.content.toLowerCase().includes(keyword) ||
              m.summary.toLowerCase().includes(keyword) ||
              m.project.toLowerCase().includes(keyword) ||
              (m.codename ?? '').toLowerCase().includes(keyword) ||
              (m.keywords ?? '').toLowerCase().includes(keyword),
          );
        },
      });
    }

    if (upperSql.includes('(TAGS LIKE ? OR KEYWORDS LIKE ?)')) {
      handlers.push({
        position: pos('(TAGS LIKE ? OR KEYWORDS LIKE ?)'),
        run: () => {
          const tagPattern = nextParam() as string;
          nextParam();
          const tag = tagPattern.slice(2, -2);
          results = results.filter(
            (m) =>
              m.tags.includes(`"${tag}"`) ||
              m.tags.includes(tag) ||
              (m.keywords ?? '').includes(`"${tag}"`),
          );
        },
      });
    } else if (upperSql.includes('TAGS LIKE ?')) {
      handlers.push({
        position: pos('TAGS LIKE ?'),
        run: () => {
          const tagPattern = nextParam() as string;
          const tag = tagPattern.slice(2, -2);
          results = results.filter((m) => m.tags.includes(`"${tag}"`) || m.tags.includes(tag));
        },
      });
    }

    handlers.sort((a, b) => a.position - b.position);
    for (const handler of handlers) {
      handler.run();
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
    this.relations.clear();
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
