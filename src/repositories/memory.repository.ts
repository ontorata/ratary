import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { MemoryRow } from '../types/memory.js';
import {
  generateId,
  nowISO,
  rowToMemory,
  tagsToJson,
  keywordsToJson,
} from '../utils/memory-mapper.js';
import { DatabaseError } from '../types/errors.js';
import type { Memory } from '../types/memory.js';
import {
  formatCodename,
  parseCodenameSequence,
  resolveCodenamePrefix,
} from '../knowledge/codename.generator.js';
import { slugify } from '../knowledge/slug.generator.js';
import type { MemoryType } from '../types/knowledge.js';
import type { MemoryLevel } from '../types/memory-level.js';
import { DEFAULT_MEMORY_LEVEL } from '../types/memory-level.js';
import type {
  InsertMemoryData,
  ListFilters,
  SearchFilters,
  UpdateMemoryData,
} from '../types/memory-persistence.js';
import type { IMemoryRepository } from './memory.repository.interface.js';
import { appendWorkspaceFilter } from './repository-scope.js';

const CODENAME_MAX_RETRIES = 3;

const RETRIEVAL_MEMORY_SELECT = `id, title, project, '' as content, summary, tags, favorite, archived,
  owner_id, created_at, updated_at, codename, slug, keywords, category, memory_type,
  importance, language, notes, project_id, level, last_accessed, access_count,
  embedding_id, object_key, semantic_hash`;

const MEMORY_SELECT = `id, title, project, content, summary, tags, favorite, archived,
  owner_id, created_at, updated_at, codename, slug, keywords, category, memory_type,
  importance, language, notes, project_id, level, last_accessed, access_count,
  embedding_id, object_key, semantic_hash, workspace_id, last_modified_by_agent_id`;

export class MemoryRepository implements IMemoryRepository {
  constructor(private readonly db: ISqlDatabase) {}

  async allocateCodename(ownerId: string, prefix: string): Promise<string> {
    const pattern = `${prefix.toUpperCase()}-%`;
    const rows = await this.db.query<{ codename: string }>(
      `SELECT codename FROM memories
       WHERE owner_id = ? AND codename LIKE ?
       ORDER BY codename DESC LIMIT 1`,
      [ownerId, pattern],
    );

    const last = rows[0]?.codename;
    const lastSeq = last ? parseCodenameSequence(last, prefix) : 0;
    return formatCodename(prefix, lastSeq + 1);
  }

  async slugExists(ownerId: string, slug: string, excludeSlug?: string): Promise<boolean> {
    if (excludeSlug && slug === excludeSlug) return false;

    const rows = await this.db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM memories
       WHERE owner_id = ? AND slug = ?`,
      [ownerId, slug],
    );
    return (rows[0]?.count ?? 0) > 0;
  }

  async insert(data: InsertMemoryData): Promise<Memory> {
    const id = data.id ?? generateId();
    const now = data.createdAt ?? nowISO();
    const updatedAt = data.updatedAt ?? now;
    const ownerId = data.ownerId ?? '';
    const projectId = data.projectId ?? slugify(data.project ?? '');
    const level = data.level ?? DEFAULT_MEMORY_LEVEL;

    for (let attempt = 0; attempt < CODENAME_MAX_RETRIES; attempt++) {
      const codename =
        attempt === 0
          ? data.codename
          : await this.allocateCodename(
              ownerId,
              resolveCodenamePrefix({
                memoryType: data.memoryType as MemoryType,
                category: data.category,
                project: data.project,
              }),
            );

      try {
        await this.db.execute(
          `INSERT INTO memories (
            id, title, project, content, summary, tags, favorite, archived,
            owner_id, created_at, updated_at,
            codename, slug, keywords, category, memory_type, importance, language, notes,
            project_id, level, last_accessed, access_count, embedding_id, object_key, semantic_hash,
            workspace_id, last_modified_by_agent_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            data.title,
            data.project,
            data.content,
            data.summary,
            tagsToJson(data.tags),
            data.favorite ? 1 : 0,
            data.archived ? 1 : 0,
            ownerId,
            now,
            updatedAt,
            codename,
            data.slug,
            keywordsToJson(data.keywords),
            data.category,
            data.memoryType,
            data.importance,
            data.language,
            data.notes,
            projectId,
            level,
            data.lastAccessed ?? null,
            data.accessCount ?? 0,
            null,
            null,
            data.semanticHash ?? null,
            data.workspaceId ?? null,
            data.lastModifiedByAgentId ?? null,
          ],
        );

        const memory = await this.findById(id, ownerId, data.workspaceId);
        if (!memory) {
          throw new DatabaseError('Failed to retrieve inserted memory');
        }
        return memory;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('UNIQUE') && attempt < CODENAME_MAX_RETRIES - 1) {
          continue;
        }
        throw error;
      }
    }

    throw new DatabaseError('Failed to insert memory after codename retries');
  }

  async update(
    id: string,
    ownerId: string,
    data: UpdateMemoryData,
    workspaceId?: string,
  ): Promise<Memory | null> {
    const existing = await this.findById(id, ownerId, workspaceId);
    if (!existing) return null;

    const updated: Memory = {
      ...existing,
      title: data.title ?? existing.title,
      project: data.project ?? existing.project,
      projectId:
        data.projectId ?? (data.project !== undefined ? slugify(data.project) : existing.projectId),
      content: data.content ?? existing.content,
      summary: data.summary ?? existing.summary,
      tags: data.tags ?? existing.tags,
      keywords: data.keywords ?? existing.keywords,
      category: data.category ?? existing.category,
      memoryType: data.memoryType ?? existing.memoryType,
      importance: data.importance ?? existing.importance,
      language: data.language ?? existing.language,
      notes: data.notes ?? existing.notes,
      slug: data.slug ?? existing.slug,
      level: data.level ?? existing.level,
      favorite: data.favorite ?? existing.favorite,
      archived: data.archived ?? existing.archived,
      updatedAt: nowISO(),
    };

    const updateConditions = ['id = ?', 'owner_id = ?'];
    const updateParams: unknown[] = [
      updated.title,
      updated.project,
      updated.content,
      updated.summary,
      tagsToJson(updated.tags),
      keywordsToJson(updated.keywords),
      updated.category,
      updated.memoryType,
      updated.importance,
      updated.language,
      updated.notes,
      updated.slug,
      updated.projectId,
      updated.level,
      updated.favorite ? 1 : 0,
      updated.archived ? 1 : 0,
      updated.updatedAt,
      data.lastModifiedByAgentId ?? null,
      id,
      ownerId,
    ];
    appendWorkspaceFilter(updateConditions, updateParams, workspaceId);

    await this.db.execute(
      `UPDATE memories
       SET title = ?, project = ?, content = ?, summary = ?, tags = ?,
           keywords = ?, category = ?, memory_type = ?, importance = ?,
           language = ?, notes = ?, slug = ?, project_id = ?, level = ?,
           favorite = ?, archived = ?, updated_at = ?, last_modified_by_agent_id = ?
       WHERE ${updateConditions.join(' AND ')}`,
      updateParams,
    );

    return updated;
  }

  async delete(id: string, ownerId: string, workspaceId?: string): Promise<boolean> {
    const conditions = ['id = ?', 'owner_id = ?'];
    const params: unknown[] = [id, ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    const result = await this.db.execute(
      `DELETE FROM memories WHERE ${conditions.join(' AND ')}`,
      params,
    );
    return (result.meta?.changes ?? 0) > 0;
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
    if (filters.tag) {
      return this.searchByTag(filters.tag, filters);
    }
    if (filters.project && !filters.query) {
      return this.searchByProject(filters.project, filters);
    }
    if (filters.query) {
      const conditions: string[] = [
        'owner_id = ?',
        '(title LIKE ? OR content LIKE ? OR summary LIKE ? OR project LIKE ? OR codename LIKE ? OR keywords LIKE ?)',
      ];
      const likePattern = `%${filters.query}%`;
      const params: unknown[] = [
        filters.ownerId,
        likePattern,
        likePattern,
        likePattern,
        likePattern,
        likePattern,
        likePattern,
      ];
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

  async toggleFavorite(id: string, ownerId: string, workspaceId?: string): Promise<Memory | null> {
    const existing = await this.findById(id, ownerId, workspaceId);
    if (!existing) return null;

    const newFavorite = !existing.favorite;
    const updatedAt = nowISO();
    const conditions = ['id = ?', 'owner_id = ?'];
    const params: unknown[] = [newFavorite ? 1 : 0, updatedAt, id, ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    await this.db.execute(
      `UPDATE memories SET favorite = ?, updated_at = ? WHERE ${conditions.join(' AND ')}`,
      params,
    );

    return { ...existing, favorite: newFavorite, updatedAt };
  }

  async archive(
    id: string,
    ownerId: string,
    archived = true,
    workspaceId?: string,
  ): Promise<Memory | null> {
    const existing = await this.findById(id, ownerId, workspaceId);
    if (!existing) return null;

    const updatedAt = nowISO();
    const conditions = ['id = ?', 'owner_id = ?'];
    const params: unknown[] = [archived ? 1 : 0, updatedAt, id, ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    await this.db.execute(
      `UPDATE memories SET archived = ?, updated_at = ? WHERE ${conditions.join(' AND ')}`,
      params,
    );

    return { ...existing, archived, updatedAt };
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

  async applyKnowledgeBackfill(
    id: string,
    ownerId: string,
    data: {
      codename: string;
      slug: string;
      summary: string;
      keywords: string[];
      category: string;
      memoryType: string;
      importance: number;
      language: string;
      notes: string;
    },
  ): Promise<void> {
    await this.db.execute(
      `UPDATE memories
       SET codename = ?, slug = ?, summary = ?, keywords = ?, category = ?,
           memory_type = ?, importance = ?, language = ?, notes = ?, updated_at = ?
       WHERE id = ? AND owner_id = ?`,
      [
        data.codename,
        data.slug,
        data.summary,
        keywordsToJson(data.keywords),
        data.category,
        data.memoryType,
        data.importance,
        data.language,
        data.notes,
        nowISO(),
        id,
        ownerId,
      ],
    );
  }

  async deleteAllByOwner(ownerId: string, workspaceId?: string): Promise<void> {
    const conditions = ['owner_id = ?'];
    const params: unknown[] = [ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);
    await this.db.execute(`DELETE FROM memories WHERE ${conditions.join(' AND ')}`, params);
  }

  async findRetrievalCandidates(
    filters: import('./memory.repository.interface.js').RetrievalFilters,
  ): Promise<Memory[]> {
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
      conditions.push(
        '(title LIKE ? OR content LIKE ? OR summary LIKE ? OR project LIKE ? OR codename LIKE ? OR keywords LIKE ?)',
      );
      const likePattern = `%${filters.query}%`;
      params.push(likePattern, likePattern, likePattern, likePattern, likePattern, likePattern);
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

  async recordAccess(id: string, ownerId: string, workspaceId?: string): Promise<void> {
    await this.recordAccessBatch([id], ownerId, workspaceId);
  }

  async recordAccessBatch(ids: string[], ownerId: string, workspaceId?: string): Promise<void> {
    if (ids.length === 0) return;

    const now = nowISO();
    const placeholders = ids.map(() => '?').join(', ');
    const conditions = [`id IN (${placeholders})`, 'owner_id = ?'];
    const params: unknown[] = [now, ...ids, ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    await this.db.execute(
      `UPDATE memories SET last_accessed = ?, access_count = access_count + 1
       WHERE ${conditions.join(' AND ')}`,
      params,
    );
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

  async bumpImportance(
    id: string,
    ownerId: string,
    importance: number,
    workspaceId?: string,
  ): Promise<Memory | null> {
    const existing = await this.findById(id, ownerId, workspaceId);
    if (!existing) return null;

    const updatedAt = nowISO();
    const conditions = ['id = ?', 'owner_id = ?'];
    const params: unknown[] = [importance, updatedAt, id, ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    await this.db.execute(
      `UPDATE memories SET importance = ?, updated_at = ? WHERE ${conditions.join(' AND ')}`,
      params,
    );

    return { ...existing, importance, updatedAt };
  }

  async applyMemoryIntelligenceBackfill(
    id: string,
    ownerId: string,
    data: { projectId: string; level: MemoryLevel; semanticHash: string },
  ): Promise<void> {
    const updatedAt = nowISO();
    await this.db.execute(
      `UPDATE memories SET project_id = ?, level = ?, semantic_hash = ?, updated_at = ?
       WHERE id = ? AND owner_id = ?`,
      [data.projectId, data.level, data.semanticHash, updatedAt, id, ownerId],
    );
  }

  async applyEmbeddingBackfill(
    id: string,
    ownerId: string,
    data: { embeddingId: string },
  ): Promise<void> {
    await this.db.execute(`UPDATE memories SET embedding_id = ? WHERE id = ? AND owner_id = ?`, [
      data.embeddingId,
      id,
      ownerId,
    ]);
  }

  async applyCompressionMetadata(
    id: string,
    ownerId: string,
    metadata: Record<string, unknown>,
    version: number,
    workspaceId?: string,
  ): Promise<void> {
    const updatedAt = nowISO();
    const conditions = ['id = ?', 'owner_id = ?'];
    const params: unknown[] = [JSON.stringify(metadata), version, updatedAt, id, ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    await this.db.execute(
      `UPDATE memories SET compression_meta = ?, compression_version = ?, updated_at = ?
       WHERE ${conditions.join(' AND ')}`,
      params,
    );
  }

  async setLifecycleState(
    id: string,
    ownerId: string,
    state: string,
    workspaceId?: string,
  ): Promise<Memory | null> {
    const existing = await this.findById(id, ownerId, workspaceId);
    if (!existing) return null;

    const updatedAt = nowISO();
    const conditions = ['id = ?', 'owner_id = ?'];
    const params: unknown[] = [state, updatedAt, id, ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    await this.db.execute(
      `UPDATE memories SET lifecycle_state = ?, updated_at = ? WHERE ${conditions.join(' AND ')}`,
      params,
    );

    return { ...existing, updatedAt };
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
