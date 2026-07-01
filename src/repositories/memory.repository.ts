import type { D1Client } from '../db/d1-client.js';
import type { MemoryRow } from '../types/memory.js';
import { generateId, nowISO, rowToMemory, tagsToJson } from '../utils/memory-mapper.js';
import type { Memory } from '../types/memory.js';

export interface InsertMemoryData {
  title: string;
  project: string;
  content: string;
  summary: string;
  tags: string[];
  favorite: boolean;
  archived?: boolean;
  ownerId?: string;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateMemoryData {
  title?: string;
  project?: string;
  content?: string;
  summary?: string;
  tags?: string[];
  favorite?: boolean;
  archived?: boolean;
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
  favorite?: boolean;
  archived?: boolean;
  limit: number;
  offset: number;
}

export class MemoryRepository {
  constructor(private readonly db: D1Client) {}

  async insert(data: InsertMemoryData): Promise<Memory> {
    const id = data.id ?? generateId();
    const now = data.createdAt ?? nowISO();
    const updatedAt = data.updatedAt ?? now;
    const ownerId = data.ownerId ?? '';

    await this.db.execute(
      `INSERT INTO memories (id, title, project, content, summary, tags, favorite, archived, owner_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ],
    );

    const memory = await this.findById(id, ownerId);
    if (!memory) {
      throw new Error('Failed to retrieve inserted memory');
    }
    return memory;
  }

  async update(id: string, ownerId: string, data: UpdateMemoryData): Promise<Memory | null> {
    const existing = await this.findById(id, ownerId);
    if (!existing) return null;

    const updated: Memory = {
      ...existing,
      title: data.title ?? existing.title,
      project: data.project ?? existing.project,
      content: data.content ?? existing.content,
      summary: data.summary ?? existing.summary,
      tags: data.tags ?? existing.tags,
      favorite: data.favorite ?? existing.favorite,
      archived: data.archived ?? existing.archived,
      updatedAt: nowISO(),
    };

    await this.db.execute(
      `UPDATE memories
       SET title = ?, project = ?, content = ?, summary = ?, tags = ?,
           favorite = ?, archived = ?, updated_at = ?
       WHERE id = ? AND owner_id = ?`,
      [
        updated.title,
        updated.project,
        updated.content,
        updated.summary,
        tagsToJson(updated.tags),
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
    const result = await this.db.execute(
      'DELETE FROM memories WHERE id = ? AND owner_id = ?',
      [id, ownerId],
    );
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

  async search(filters: SearchFilters): Promise<{ memories: Memory[]; total: number }> {
    if (filters.tag) {
      return this.searchByTag(filters.tag, filters);
    }
    if (filters.project && !filters.query) {
      return this.searchByProject(filters.project, filters);
    }
    if (filters.query) {
      const conditions: string[] = [
        'owner_id = ?',
        '(title LIKE ? OR content LIKE ? OR summary LIKE ? OR project LIKE ?)',
      ];
      const likePattern = `%${filters.query}%`;
      const params: unknown[] = [
        filters.ownerId,
        likePattern,
        likePattern,
        likePattern,
        likePattern,
      ];

      if (filters.project) {
        conditions.push('project = ?');
        params.push(filters.project);
      }

      this.applySearchFilters(conditions, params, filters);

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

  async deleteAllByOwner(ownerId: string): Promise<void> {
    await this.db.execute('DELETE FROM memories WHERE owner_id = ?', [ownerId]);
  }

  private async searchByTag(
    tag: string,
    filters: SearchFilters,
  ): Promise<{ memories: Memory[]; total: number }> {
    const conditions: string[] = ['owner_id = ?', 'tags LIKE ?'];
    const params: unknown[] = [filters.ownerId, `%"${tag}"%`];

    this.applySearchFilters(conditions, params, filters);

    return this.executeSearch(conditions, params, filters.limit, filters.offset);
  }

  private async searchByProject(
    project: string,
    filters: SearchFilters,
  ): Promise<{ memories: Memory[]; total: number }> {
    const conditions: string[] = ['owner_id = ?', 'project = ?'];
    const params: unknown[] = [filters.ownerId, project];

    this.applySearchFilters(conditions, params, filters);

    return this.executeSearch(conditions, params, filters.limit, filters.offset);
  }

  private applySearchFilters(
    conditions: string[],
    params: unknown[],
    filters: Pick<SearchFilters, 'favorite' | 'archived' | 'project'>,
  ): void {
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
