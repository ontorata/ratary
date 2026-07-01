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
  project?: string;
  favorite?: boolean;
  archived?: boolean;
  limit: number;
  offset: number;
}

export interface SearchFilters {
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

    await this.db.execute(
      `INSERT INTO memories (id, title, project, content, summary, tags, favorite, archived, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        data.project,
        data.content,
        data.summary,
        tagsToJson(data.tags),
        data.favorite ? 1 : 0,
        data.archived ? 1 : 0,
        now,
        updatedAt,
      ],
    );

    const memory = await this.findById(id);
    if (!memory) {
      throw new Error('Failed to retrieve inserted memory');
    }
    return memory;
  }

  async update(id: string, data: UpdateMemoryData): Promise<Memory | null> {
    const existing = await this.findById(id);
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
       WHERE id = ?`,
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
      ],
    );

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.execute('DELETE FROM memories WHERE id = ?', [id]);
    return (result.meta?.changes ?? 0) > 0;
  }

  async findById(id: string): Promise<Memory | null> {
    const rows = await this.db.query<MemoryRow>('SELECT * FROM memories WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return rowToMemory(rows[0]);
  }

  async findAll(filters: ListFilters): Promise<{ memories: Memory[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];

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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

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

  async searchByText(
    keyword: string,
    filters: Omit<SearchFilters, 'query' | 'tag'>,
  ): Promise<{ memories: Memory[]; total: number }> {
    const conditions: string[] = [
      '(title LIKE ? OR content LIKE ? OR summary LIKE ? OR project LIKE ?)',
    ];
    const likePattern = `%${keyword}%`;
    const params: unknown[] = [likePattern, likePattern, likePattern, likePattern];

    this.applySearchFilters(conditions, params, filters);

    return this.executeSearch(conditions, params, filters.limit, filters.offset);
  }

  async searchByTag(
    tag: string,
    filters: Omit<SearchFilters, 'query' | 'tag'>,
  ): Promise<{ memories: Memory[]; total: number }> {
    const conditions: string[] = ["tags LIKE ?"];
    const params: unknown[] = [`%"${tag}"%`];

    this.applySearchFilters(conditions, params, filters);

    return this.executeSearch(conditions, params, filters.limit, filters.offset);
  }

  async searchByProject(
    project: string,
    filters: Omit<SearchFilters, 'query' | 'tag' | 'project'>,
  ): Promise<{ memories: Memory[]; total: number }> {
    const conditions: string[] = ['project = ?'];
    const params: unknown[] = [project];

    this.applySearchFilters(conditions, params, filters);

    return this.executeSearch(conditions, params, filters.limit, filters.offset);
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
        '(title LIKE ? OR content LIKE ? OR summary LIKE ? OR project LIKE ?)',
      ];
      const likePattern = `%${filters.query}%`;
      const params: unknown[] = [likePattern, likePattern, likePattern, likePattern];

      if (filters.project) {
        conditions.push('project = ?');
        params.push(filters.project);
      }

      this.applySearchFilters(conditions, params, filters);

      return this.executeSearch(conditions, params, filters.limit, filters.offset);
    }

    return this.findAll({
      project: filters.project,
      favorite: filters.favorite,
      archived: filters.archived,
      limit: filters.limit,
      offset: filters.offset,
    });
  }

  async toggleFavorite(id: string): Promise<Memory | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const newFavorite = !existing.favorite;
    await this.db.execute(
      'UPDATE memories SET favorite = ?, updated_at = ? WHERE id = ?',
      [newFavorite ? 1 : 0, nowISO(), id],
    );

    return { ...existing, favorite: newFavorite, updatedAt: nowISO() };
  }

  async archive(id: string, archived = true): Promise<Memory | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updatedAt = nowISO();
    await this.db.execute('UPDATE memories SET archived = ?, updated_at = ? WHERE id = ?', [
      archived ? 1 : 0,
      updatedAt,
      id,
    ]);

    return { ...existing, archived, updatedAt };
  }

  async listProjects(): Promise<string[]> {
    const rows = await this.db.query<{ project: string }>(
      `SELECT DISTINCT project FROM memories
       WHERE project != '' AND archived = 0
       ORDER BY project ASC`,
    );
    return rows.map((r) => r.project);
  }

  async listTags(): Promise<string[]> {
    const rows = await this.db.query<{ tags: string }>(
      'SELECT tags FROM memories WHERE archived = 0',
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

  async findAllRaw(): Promise<Memory[]> {
    const rows = await this.db.query<MemoryRow>(
      'SELECT * FROM memories ORDER BY created_at ASC',
    );
    return rows.map(rowToMemory);
  }

  async deleteAll(): Promise<void> {
    await this.db.execute('DELETE FROM memories');
  }

  private applySearchFilters(
    conditions: string[],
    params: unknown[],
    filters: Pick<SearchFilters, 'favorite' | 'archived' | 'project'>,
  ): void {
    if (filters.project && !conditions.some((c) => c.includes('project ='))) {
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
