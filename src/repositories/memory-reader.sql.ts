import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { MemoryRow } from '../types/memory.js';
import { rowToMemory } from '../utils/memory-mapper.js';
import type { Memory } from '../types/memory.js';
import type { ListFilters, SearchFilters } from '../types/memory-persistence.js';
import type { IMemoryReader, RetrievalFilters } from './memory.repository.interface.js';
import { appendWorkspaceFilter } from './repository-scope.js';
import {
  applyIgnorePatternsToSql,
  applySearchFilterGrammarToSql,
  parseSearchFilterGrammar,
} from '../search/precision/index.js';
import { MEMORY_SELECT, RETRIEVAL_MEMORY_SELECT } from './memory-sql.constants.js';
import { buildColumnsSubstringMatch } from './sql-substring-match.js';

const SEARCH_QUERY_COLUMNS = [
  'title',
  'content',
  'summary',
  'project',
  'codename',
  'keywords',
  'aliases',
] as const;

const RETRIEVAL_QUERY_COLUMNS = [
  'title',
  'content',
  'summary',
  'project',
  'codename',
  'keywords',
] as const;

/** Internal read SQL for memories (Phase 11C — ADR-019). */
export class MemoryReaderSql implements IMemoryReader {
  constructor(private readonly db: ISqlDatabase) {}

  async slugExists(ownerId: string, slug: string, excludeSlug?: string): Promise<boolean> {
    if (excludeSlug && slug === excludeSlug) return false;

    const rows = await this.db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM memories
       WHERE owner_id = ? AND slug = ?`,
      [ownerId, slug],
    );
    return (rows[0]?.count ?? 0) > 0;
  }

  async findById(id: string, ownerId: string, workspaceId?: string): Promise<Memory | null> {
    const conditions = ['id = ?', 'owner_id = ?'];
    const params: unknown[] = [id, ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    const rows = await this.db.query<MemoryRow>(
      `SELECT ${RETRIEVAL_MEMORY_SELECT} FROM memories WHERE ${conditions.join(' AND ')}`,
      params,
    );
    if (rows.length === 0) return null;
    return rowToMemory(rows[0]);
  }

  async findByIds(ids: string[], ownerId: string, workspaceId?: string): Promise<Memory[]> {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(', ');
    const conditions = [`id IN (${placeholders})`, 'owner_id = ?'];
    const params: unknown[] = [...ids, ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    const rows = await this.db.query<MemoryRow>(
      `SELECT ${RETRIEVAL_MEMORY_SELECT} FROM memories WHERE ${conditions.join(' AND ')}`,
      params,
    );
    return rows.map(rowToMemory);
  }

  async findByIdsWithContent(
    ids: string[],
    ownerId: string,
    workspaceId?: string,
  ): Promise<Memory[]> {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(', ');
    const conditions = [`id IN (${placeholders})`, 'owner_id = ?'];
    const params: unknown[] = [...ids, ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    const rows = await this.db.query<MemoryRow>(
      `SELECT ${MEMORY_SELECT} FROM memories WHERE ${conditions.join(' AND ')}`,
      params,
    );
    return rows.map(rowToMemory);
  }

  async findByCodename(
    ownerId: string,
    codename: string,
    workspaceId?: string,
  ): Promise<Memory | null> {
    const conditions = ['owner_id = ?', 'codename = ?'];
    const params: unknown[] = [ownerId, codename];
    appendWorkspaceFilter(conditions, params, workspaceId);

    const rows = await this.db.query<MemoryRow>(
      `SELECT ${MEMORY_SELECT} FROM memories WHERE ${conditions.join(' AND ')}`,
      params,
    );
    if (rows.length === 0) return null;
    return rowToMemory(rows[0]);
  }

  async findBySlug(ownerId: string, slug: string, workspaceId?: string): Promise<Memory | null> {
    const conditions = ['owner_id = ?', 'slug = ?'];
    const params: unknown[] = [ownerId, slug];
    appendWorkspaceFilter(conditions, params, workspaceId);

    const rows = await this.db.query<MemoryRow>(
      `SELECT ${MEMORY_SELECT} FROM memories WHERE ${conditions.join(' AND ')}`,
      params,
    );
    if (rows.length === 0) return null;
    return rowToMemory(rows[0]);
  }

  async findBySourcePath(
    ownerId: string,
    sourcePath: string,
    workspaceId?: string,
  ): Promise<Memory | null> {
    const conditions = ['owner_id = ?', 'source_path = ?'];
    const params: unknown[] = [ownerId, sourcePath.replace(/\\/g, '/')];
    appendWorkspaceFilter(conditions, params, workspaceId);

    const rows = await this.db.query<MemoryRow>(
      `SELECT ${MEMORY_SELECT} FROM memories WHERE ${conditions.join(' AND ')}`,
      params,
    );
    if (rows.length === 0) return null;
    return rowToMemory(rows[0]);
  }

  async findAll(filters: ListFilters): Promise<{ memories: Memory[]; total: number }> {
    const conditions: string[] = ['owner_id = ?'];
    const params: unknown[] = [filters.ownerId];
    appendWorkspaceFilter(conditions, params, filters.workspaceId);

    if (filters.project !== undefined) {
      conditions.push('project = ?');
      params.push(filters.project);
    }
    if (filters.favorite !== undefined) {
      conditions.push('favorite = ?');
      params.push(filters.favorite ? 1 : 0);
    }
    if (filters.archived !== undefined) {
      conditions.push('archived = ?');
      params.push(filters.archived ? 1 : 0);
    } else {
      conditions.push('archived = 0');
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countRows = await this.db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM memories ${whereClause}`,
      params,
    );
    const total = countRows[0]?.count ?? 0;

    const rows = await this.db.query<MemoryRow>(
      `SELECT ${MEMORY_SELECT} FROM memories ${whereClause}
       ORDER BY updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, filters.limit, filters.offset],
    );

    return {
      memories: rows.map(rowToMemory),
      total,
    };
  }

  async findSearchCandidates(
    filters: SearchFilters,
  ): Promise<{ memories: Memory[]; total: number }> {
    const grammar = parseSearchFilterGrammar(filters.grammar);
    if (grammar || (filters.ignorePatterns && filters.ignorePatterns.length > 0)) {
      return this.searchWithPrecisionFilters(filters, grammar);
    }

    if (filters.tag) {
      return this.searchByTag(filters.tag, filters);
    }
    if (filters.project && !filters.query) {
      return this.searchByProject(filters.project, filters);
    }
    if (filters.query) {
      const match = buildColumnsSubstringMatch(SEARCH_QUERY_COLUMNS, filters.query);
      const conditions: string[] = ['owner_id = ?', match.sql];
      const params: unknown[] = [filters.ownerId, ...match.params];
      appendWorkspaceFilter(conditions, params, filters.workspaceId);

      this.applyExtendedFilters(conditions, params, filters);

      return this.executeSearch(conditions, params, filters.limit, filters.offset);
    }

    return this.findAll({
      ownerId: filters.ownerId,
      workspaceId: filters.workspaceId,
      project: filters.project,
      favorite: filters.favorite,
      archived: filters.archived,
      limit: filters.limit,
      offset: filters.offset,
    });
  }

  async search(filters: SearchFilters): Promise<{ memories: Memory[]; total: number }> {
    return this.findSearchCandidates(filters);
  }

  async listDistinctCategories(ownerId: string, workspaceId?: string): Promise<string[]> {
    const conditions = ['owner_id = ?', "category != ''", 'archived = 0'];
    const params: unknown[] = [ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    const rows = await this.db.query<{ category: string }>(
      `SELECT DISTINCT category FROM memories
       WHERE ${conditions.join(' AND ')}
       ORDER BY category ASC`,
      params,
    );
    return rows.map((r) => r.category);
  }

  async listProjects(ownerId: string, workspaceId?: string): Promise<string[]> {
    const conditions = ['owner_id = ?', "project != ''", 'archived = 0'];
    const params: unknown[] = [ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    const rows = await this.db.query<{ project: string }>(
      `SELECT DISTINCT project FROM memories
       WHERE ${conditions.join(' AND ')}
       ORDER BY project ASC`,
      params,
    );
    return rows.map((r) => r.project);
  }

  async listTags(ownerId: string, workspaceId?: string): Promise<string[]> {
    const conditions = ['owner_id = ?', 'archived = 0'];
    const params: unknown[] = [ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    const rows = await this.db.query<{ tags: string }>(
      `SELECT tags FROM memories WHERE ${conditions.join(' AND ')}`,
      params,
    );

    const tagSet = new Set<string>();
    for (const row of rows) {
      try {
        const tags = JSON.parse(row.tags) as string[];
        if (Array.isArray(tags)) {
          tags.forEach((t) => tagSet.add(t));
        }
      } catch {
        // skip invalid JSON
      }
    }

    return Array.from(tagSet).sort();
  }

  async findAllByOwner(ownerId: string, workspaceId?: string): Promise<Memory[]> {
    const conditions = ['owner_id = ?'];
    const params: unknown[] = [ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    const rows = await this.db.query<MemoryRow>(
      `SELECT ${MEMORY_SELECT} FROM memories WHERE ${conditions.join(' AND ')} ORDER BY created_at ASC`,
      params,
    );
    return rows.map(rowToMemory);
  }

  async findWithoutCodename(ownerId: string, limit: number): Promise<Memory[]> {
    const rows = await this.db.query<MemoryRow>(
      `SELECT ${MEMORY_SELECT} FROM memories
       WHERE owner_id = ? AND (codename IS NULL OR codename = '')
       ORDER BY created_at ASC
       LIMIT ?`,
      [ownerId, limit],
    );
    return rows.map(rowToMemory);
  }

  async findWithoutEmbedding(ownerId: string, limit: number): Promise<Memory[]> {
    const rows = await this.db.query<MemoryRow>(
      `SELECT ${MEMORY_SELECT} FROM memories
       WHERE owner_id = ? AND (embedding_id IS NULL OR embedding_id = '')
       ORDER BY updated_at DESC
       LIMIT ?`,
      [ownerId, limit],
    );
    return rows.map(rowToMemory);
  }

  async findRetrievalCandidates(filters: RetrievalFilters): Promise<Memory[]> {
    const conditions: string[] = ['owner_id = ?'];
    const params: unknown[] = [filters.ownerId];
    appendWorkspaceFilter(conditions, params, filters.workspaceId);

    if (filters.archived === true) {
      conditions.push('archived = ?');
      params.push(1);
    } else {
      conditions.push('archived = 0');
    }

    if (filters.projectId) {
      conditions.push('project_id = ?');
      params.push(filters.projectId);
    }

    if (filters.levels && filters.levels.length > 0) {
      const placeholders = filters.levels.map(() => '?').join(', ');
      conditions.push(`level IN (${placeholders})`);
      params.push(...filters.levels);
    }

    if (filters.importanceMin !== undefined) {
      conditions.push('importance >= ?');
      params.push(filters.importanceMin);
    }

    if (filters.query) {
      const match = buildColumnsSubstringMatch(RETRIEVAL_QUERY_COLUMNS, filters.query);
      conditions.push(match.sql);
      params.push(...match.params);
    }

    if (filters.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags.map(() => '(tags LIKE ? OR keywords LIKE ?)');
      conditions.push(`(${tagConditions.join(' OR ')})`);
      for (const tag of filters.tags) {
        params.push(`%"${tag}"%`, `%"${tag}"%`);
      }
    }

    const limit = Math.min(filters.maxCandidates, 100);
    params.push(limit);

    const rows = await this.db.query<MemoryRow>(
      `SELECT ${RETRIEVAL_MEMORY_SELECT} FROM memories WHERE ${conditions.join(' AND ')}
       ORDER BY importance DESC, updated_at DESC
       LIMIT ?`,
      params,
    );

    return rows.map(rowToMemory);
  }

  async findDuplicatesBySemanticHash(filters: {
    ownerId: string;
    workspaceId?: string;
    projectId?: string;
    semanticHash: string;
  }): Promise<Memory[]> {
    const conditions = ['owner_id = ?', 'archived = 0', 'semantic_hash = ?'];
    const params: unknown[] = [filters.ownerId, filters.semanticHash];
    appendWorkspaceFilter(conditions, params, filters.workspaceId);

    if (filters.projectId) {
      conditions.push('project_id = ?');
      params.push(filters.projectId);
    }

    const rows = await this.db.query<MemoryRow>(
      `SELECT ${MEMORY_SELECT} FROM memories WHERE ${conditions.join(' AND ')} ORDER BY importance DESC, updated_at DESC`,
      params,
    );
    return rows.map(rowToMemory);
  }

  async findStaleCandidates(filters: {
    ownerId: string;
    workspaceId?: string;
    projectId?: string;
    minAccessCount: number;
    olderThanDays: number;
  }): Promise<Memory[]> {
    const cutoff = new Date(Date.now() - filters.olderThanDays * 24 * 60 * 60 * 1000).toISOString();
    const conditions = [
      'owner_id = ?',
      'archived = 0',
      "level IN ('note', 'raw')",
      'access_count >= ?',
      'updated_at < ?',
    ];
    const params: unknown[] = [filters.ownerId, filters.minAccessCount, cutoff];
    appendWorkspaceFilter(conditions, params, filters.workspaceId);

    if (filters.projectId) {
      conditions.push('project_id = ?');
      params.push(filters.projectId);
    }

    const rows = await this.db.query<MemoryRow>(
      `SELECT ${MEMORY_SELECT} FROM memories WHERE ${conditions.join(' AND ')} ORDER BY access_count DESC`,
      params,
    );
    return rows.map(rowToMemory);
  }

  async findUpdatedSince(filters: {
    ownerId: string;
    workspaceId?: string;
    since: string;
    limit: number;
  }): Promise<Memory[]> {
    const conditions = ['owner_id = ?', 'archived = 0'];
    const params: unknown[] = [filters.ownerId];
    appendWorkspaceFilter(conditions, params, filters.workspaceId);

    if (filters.since) {
      conditions.push('updated_at > ?');
      params.push(filters.since);
    }

    params.push(filters.limit);

    const rows = await this.db.query<MemoryRow>(
      `SELECT ${MEMORY_SELECT} FROM memories
       WHERE ${conditions.join(' AND ')}
       ORDER BY updated_at ASC
       LIMIT ?`,
      params,
    );
    return rows.map(rowToMemory);
  }

  private async searchWithPrecisionFilters(
    filters: SearchFilters,
    grammar: ReturnType<typeof parseSearchFilterGrammar>,
  ): Promise<{ memories: Memory[]; total: number }> {
    const conditions: string[] = ['owner_id = ?'];
    const params: unknown[] = [filters.ownerId];
    appendWorkspaceFilter(conditions, params, filters.workspaceId);

    if (grammar) {
      const fragment = applySearchFilterGrammarToSql(grammar);
      conditions.push(...fragment.conditions);
      params.push(...fragment.params);
    }

    if (filters.ignorePatterns?.length) {
      const ignoreFragment = applyIgnorePatternsToSql(filters.ignorePatterns);
      conditions.push(...ignoreFragment.conditions);
      params.push(...ignoreFragment.params);
    }

    if (filters.query?.trim()) {
      const match = buildColumnsSubstringMatch(SEARCH_QUERY_COLUMNS, filters.query);
      conditions.push(match.sql);
      params.push(...match.params);
    } else if (filters.tag) {
      conditions.push('(tags LIKE ? OR keywords LIKE ?)');
      params.push(`%"${filters.tag}"%`, `%"${filters.tag}"%`);
    } else if (filters.project) {
      conditions.push('project = ?');
      params.push(filters.project);
    }

    this.applyExtendedFilters(conditions, params, filters);

    return this.executeSearch(conditions, params, filters.limit, filters.offset);
  }

  private async searchByTag(
    tag: string,
    filters: SearchFilters,
  ): Promise<{ memories: Memory[]; total: number }> {
    const conditions: string[] = ['owner_id = ?', '(tags LIKE ? OR keywords LIKE ?)'];
    const params: unknown[] = [filters.ownerId, `%"${tag}"%`, `%"${tag}"%`];
    appendWorkspaceFilter(conditions, params, filters.workspaceId);

    this.applyExtendedFilters(conditions, params, filters);

    return this.executeSearch(conditions, params, filters.limit, filters.offset);
  }

  private async searchByProject(
    project: string,
    filters: SearchFilters,
  ): Promise<{ memories: Memory[]; total: number }> {
    const conditions: string[] = ['owner_id = ?', 'project = ?'];
    const params: unknown[] = [filters.ownerId, project];
    appendWorkspaceFilter(conditions, params, filters.workspaceId);

    this.applyExtendedFilters(conditions, params, filters);

    return this.executeSearch(conditions, params, filters.limit, filters.offset);
  }

  private applyExtendedFilters(
    conditions: string[],
    params: unknown[],
    filters: SearchFilters,
  ): void {
    if (filters.project) {
      conditions.push('project = ?');
      params.push(filters.project);
    }
    if (filters.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }
    if (filters.memoryType) {
      conditions.push('memory_type = ?');
      params.push(filters.memoryType);
    }
    if (filters.importanceMin !== undefined) {
      conditions.push('importance >= ?');
      params.push(filters.importanceMin);
    }
    if (filters.favorite !== undefined) {
      conditions.push('favorite = ?');
      params.push(filters.favorite ? 1 : 0);
    }
    if (filters.archived !== undefined) {
      conditions.push('archived = ?');
      params.push(filters.archived ? 1 : 0);
    } else {
      conditions.push('archived = 0');
    }
  }

  private async executeSearch(
    conditions: string[],
    params: unknown[],
    limit: number,
    offset: number,
  ): Promise<{ memories: Memory[]; total: number }> {
    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countRows = await this.db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM memories ${whereClause}`,
      params,
    );
    const total = countRows[0]?.count ?? 0;

    const rows = await this.db.query<MemoryRow>(
      `SELECT ${MEMORY_SELECT} FROM memories ${whereClause}
       ORDER BY updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return {
      memories: rows.map(rowToMemory),
      total,
    };
  }
}
