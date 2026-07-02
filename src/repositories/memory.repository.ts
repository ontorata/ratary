import type { D1Client } from '../db/d1-client.js';
import type { MemoryRow } from '../types/memory.js';
import {
  generateId,
  nowISO,
  rowToMemory,
  tagsToJson,
  keywordsToJson,
} from '../utils/memory-mapper.js';
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
import type { IMemoryRepository } from './memory.repository.interface.js';

export interface InsertMemoryData {
  title: string;
  project: string;
  content: string;
  summary: string;
  tags: string[];
  keywords: string[];
  category: string;
  memoryType: string;
  importance: number;
  language: string;
  notes: string;
  codename: string;
  slug: string;
  favorite: boolean;
  archived?: boolean;
  ownerId?: string;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  projectId?: string;
  level?: MemoryLevel;
  semanticHash?: string | null;
  accessCount?: number;
  lastAccessed?: string | null;
}

export interface UpdateMemoryData {
  title?: string;
  project?: string;
  content?: string;
  summary?: string;
  tags?: string[];
  keywords?: string[];
  category?: string;
  memoryType?: string;
  importance?: number;
  language?: string;
  notes?: string;
  slug?: string;
  favorite?: boolean;
  archived?: boolean;
  projectId?: string;
  level?: MemoryLevel;
}

export interface ListFilters {
  ownerId: string;
  project?: string;
  favorite?: boolean;
  archived?: boolean;
  limit: number;
  offset: number;
}

export interface SearchFilters {
  ownerId: string;
  query?: string;
  tag?: string;
  project?: string;
  category?: string;
  memoryType?: MemoryType;
  importanceMin?: number;
  favorite?: boolean;
  archived?: boolean;
  limit: number;
  offset: number;
}

const CODENAME_MAX_RETRIES = 3;

export class MemoryRepository implements IMemoryRepository {
  constructor(private readonly db: D1Client) {}

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
            project_id, level, last_accessed, access_count, embedding_id, object_key, semantic_hash
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          ],
        );

        const memory = await this.findById(id, ownerId);
        if (!memory) {
          throw new Error('Failed to retrieve inserted memory');
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

    throw new Error('Failed to insert memory after codename retries');
  }

  async update(id: string, ownerId: string, data: UpdateMemoryData): Promise<Memory | null> {
    const existing = await this.findById(id, ownerId);
    if (!existing) return null;

    const updated: Memory = {
      ...existing,
      title: data.title ?? existing.title,
      project: data.project ?? existing.project,
      projectId: data.projectId ?? (data.project !== undefined ? slugify(data.project) : existing.projectId),
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

    await this.db.execute(
      `UPDATE memories
       SET title = ?, project = ?, content = ?, summary = ?, tags = ?,
           keywords = ?, category = ?, memory_type = ?, importance = ?,
           language = ?, notes = ?, slug = ?, project_id = ?, level = ?,
           favorite = ?, archived = ?, updated_at = ?
       WHERE id = ? AND owner_id = ?`,
      [
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
        id,
        ownerId,
      ],
    );

    return updated;
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const result = await this.db.execute('DELETE FROM memories WHERE id = ? AND owner_id = ?', [
      id,
      ownerId,
    ]);
    return (result.meta?.changes ?? 0) > 0;
  }

  async findById(id: string, ownerId: string): Promise<Memory | null> {
    const rows = await this.db.query<MemoryRow>(
      'SELECT * FROM memories WHERE id = ? AND owner_id = ?',
      [id, ownerId],
    );
    if (rows.length === 0) return null;
    return rowToMemory(rows[0]);
  }

  async findByCodename(ownerId: string, codename: string): Promise<Memory | null> {
    const rows = await this.db.query<MemoryRow>(
      'SELECT * FROM memories WHERE owner_id = ? AND codename = ?',
      [ownerId, codename],
    );
    if (rows.length === 0) return null;
    return rowToMemory(rows[0]);
  }

  async findBySlug(ownerId: string, slug: string): Promise<Memory | null> {
    const rows = await this.db.query<MemoryRow>(
      'SELECT * FROM memories WHERE owner_id = ? AND slug = ?',
      [ownerId, slug],
    );
    if (rows.length === 0) return null;
    return rowToMemory(rows[0]);
  }

  async findAll(filters: ListFilters): Promise<{ memories: Memory[]; total: number }> {
    const conditions: string[] = ['owner_id = ?'];
    const params: unknown[] = [filters.ownerId];

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
      `SELECT * FROM memories ${whereClause}
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

      this.applyExtendedFilters(conditions, params, filters);

      return this.executeSearch(conditions, params, filters.limit, filters.offset);
    }

    return this.findAll({
      ownerId: filters.ownerId,
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

  async listDistinctCategories(ownerId: string): Promise<string[]> {
    const rows = await this.db.query<{ category: string }>(
      `SELECT DISTINCT category FROM memories
       WHERE owner_id = ? AND category != '' AND archived = 0
       ORDER BY category ASC`,
      [ownerId],
    );
    return rows.map((r) => r.category);
  }

  async toggleFavorite(id: string, ownerId: string): Promise<Memory | null> {
    const existing = await this.findById(id, ownerId);
    if (!existing) return null;

    const newFavorite = !existing.favorite;
    const updatedAt = nowISO();
    await this.db.execute(
      'UPDATE memories SET favorite = ?, updated_at = ? WHERE id = ? AND owner_id = ?',
      [newFavorite ? 1 : 0, updatedAt, id, ownerId],
    );

    return { ...existing, favorite: newFavorite, updatedAt };
  }

  async archive(id: string, ownerId: string, archived = true): Promise<Memory | null> {
    const existing = await this.findById(id, ownerId);
    if (!existing) return null;

    const updatedAt = nowISO();
    await this.db.execute(
      'UPDATE memories SET archived = ?, updated_at = ? WHERE id = ? AND owner_id = ?',
      [archived ? 1 : 0, updatedAt, id, ownerId],
    );

    return { ...existing, archived, updatedAt };
  }

  async listProjects(ownerId: string): Promise<string[]> {
    const rows = await this.db.query<{ project: string }>(
      `SELECT DISTINCT project FROM memories
       WHERE owner_id = ? AND project != '' AND archived = 0
       ORDER BY project ASC`,
      [ownerId],
    );
    return rows.map((r) => r.project);
  }

  async listTags(ownerId: string): Promise<string[]> {
    const rows = await this.db.query<{ tags: string }>(
      'SELECT tags FROM memories WHERE owner_id = ? AND archived = 0',
      [ownerId],
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

  async findAllByOwner(ownerId: string): Promise<Memory[]> {
    const rows = await this.db.query<MemoryRow>(
      'SELECT * FROM memories WHERE owner_id = ? ORDER BY created_at ASC',
      [ownerId],
    );
    return rows.map(rowToMemory);
  }

  async findWithoutCodename(ownerId: string, limit: number): Promise<Memory[]> {
    const rows = await this.db.query<MemoryRow>(
      `SELECT * FROM memories
       WHERE owner_id = ? AND (codename IS NULL OR codename = '')
       ORDER BY created_at ASC
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

  async deleteAllByOwner(ownerId: string): Promise<void> {
    await this.db.execute('DELETE FROM memories WHERE owner_id = ?', [ownerId]);
  }

  async findRetrievalCandidates(filters: import('./memory.repository.interface.js').RetrievalFilters): Promise<Memory[]> {
    const conditions: string[] = ['owner_id = ?'];
    const params: unknown[] = [filters.ownerId];

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
      `SELECT * FROM memories WHERE ${conditions.join(' AND ')}
       ORDER BY importance DESC, updated_at DESC
       LIMIT ?`,
      params,
    );

    return rows.map(rowToMemory);
  }

  async recordAccess(id: string, ownerId: string): Promise<void> {
    const now = nowISO();
    await this.db.execute(
      `UPDATE memories SET last_accessed = ?, access_count = access_count + 1, updated_at = ?
       WHERE id = ? AND owner_id = ?`,
      [now, now, id, ownerId],
    );
  }

  async findDuplicatesBySemanticHash(filters: {
    ownerId: string;
    projectId?: string;
    semanticHash: string;
  }): Promise<Memory[]> {
    const conditions = ['owner_id = ?', 'archived = 0', 'semantic_hash = ?'];
    const params: unknown[] = [filters.ownerId, filters.semanticHash];

    if (filters.projectId) {
      conditions.push('project_id = ?');
      params.push(filters.projectId);
    }

    const rows = await this.db.query<MemoryRow>(
      `SELECT * FROM memories WHERE ${conditions.join(' AND ')} ORDER BY importance DESC, updated_at DESC`,
      params,
    );
    return rows.map(rowToMemory);
  }

  async findStaleCandidates(filters: {
    ownerId: string;
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

    if (filters.projectId) {
      conditions.push('project_id = ?');
      params.push(filters.projectId);
    }

    const rows = await this.db.query<MemoryRow>(
      `SELECT * FROM memories WHERE ${conditions.join(' AND ')} ORDER BY access_count DESC`,
      params,
    );
    return rows.map(rowToMemory);
  }

  async bumpImportance(id: string, ownerId: string, importance: number): Promise<Memory | null> {
    const existing = await this.findById(id, ownerId);
    if (!existing) return null;

    const updatedAt = nowISO();
    await this.db.execute(
      'UPDATE memories SET importance = ?, updated_at = ? WHERE id = ? AND owner_id = ?',
      [importance, updatedAt, id, ownerId],
    );

    return { ...existing, importance, updatedAt };
  }

  private async searchByTag(
    tag: string,
    filters: SearchFilters,
  ): Promise<{ memories: Memory[]; total: number }> {
    const conditions: string[] = ['owner_id = ?', '(tags LIKE ? OR keywords LIKE ?)'];
    const params: unknown[] = [filters.ownerId, `%"${tag}"%`, `%"${tag}"%`];

    this.applyExtendedFilters(conditions, params, filters);

    return this.executeSearch(conditions, params, filters.limit, filters.offset);
  }

  private async searchByProject(
    project: string,
    filters: SearchFilters,
  ): Promise<{ memories: Memory[]; total: number }> {
    const conditions: string[] = ['owner_id = ?', 'project = ?'];
    const params: unknown[] = [filters.ownerId, project];

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
      `SELECT * FROM memories ${whereClause}
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
