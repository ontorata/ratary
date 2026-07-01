import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import type { MemoryRow } from '../../src/types/memory.js';

export class MockD1Client implements D1Client {
  private memories: Map<string, MemoryRow> = new Map();

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.execute(sql, params);
    return result.results as T[];
  }

  async execute(sql: string, params: unknown[] = []): Promise<D1QueryResult> {
    const normalizedSql = sql.trim().toUpperCase();

    if (normalizedSql.startsWith('CREATE TABLE') || normalizedSql.startsWith('CREATE INDEX')) {
      return { results: [], success: true, meta: { changes: 0 } };
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
  }
}
