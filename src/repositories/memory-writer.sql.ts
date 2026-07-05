import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import {
  generateId,
  nowISO,
  tagsToJson,
  keywordsToJson,
  aliasesToJson,
} from '../utils/memory-mapper.js';
import { DatabaseError } from '../types/errors.js';
import type { Memory, MemoryLifecycleState } from '../types/memory.js';
import {
  formatCodename,
  parseCodenameSequence,
  resolveCodenamePrefix,
} from '../knowledge/codename.generator.js';
import { slugify } from '../knowledge/slug.generator.js';
import type { MemoryType } from '../types/knowledge.js';
import type { MemoryLevel } from '../types/memory-level.js';
import { DEFAULT_MEMORY_LEVEL } from '../types/memory-level.js';
import type { InsertMemoryData, UpdateMemoryData } from '../types/memory-persistence.js';
import type { IMemoryReader, IMemoryWriter } from './memory.repository.interface.js';
import { appendWorkspaceFilter } from './repository-scope.js';
import { CODENAME_MAX_RETRIES } from './memory-sql.constants.js';

/** Internal write SQL for memories (Phase 11C — ADR-019). */
export class MemoryWriterSql implements IMemoryWriter {
  constructor(
    private readonly db: ISqlDatabase,
    private readonly reader: IMemoryReader,
  ) {}

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
            aliases, source_path, workspace_id, last_modified_by_agent_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            aliasesToJson(data.aliases ?? []),
            data.sourcePath ?? null,
            data.workspaceId ?? null,
            data.lastModifiedByAgentId ?? null,
          ],
        );

        const memory = await this.reader.findById(id, ownerId, data.workspaceId);
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
    const existing = await this.reader.findById(id, ownerId, workspaceId);
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
      aliases: data.aliases ?? existing.aliases,
      sourcePath: data.sourcePath !== undefined ? data.sourcePath : existing.sourcePath,
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
      aliasesToJson(updated.aliases),
      updated.sourcePath,
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
           language = ?, notes = ?, slug = ?, aliases = ?, source_path = ?, project_id = ?, level = ?,
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

  async toggleFavorite(id: string, ownerId: string, workspaceId?: string): Promise<Memory | null> {
    const existing = await this.reader.findById(id, ownerId, workspaceId);
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
    const existing = await this.reader.findById(id, ownerId, workspaceId);
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

  async bumpImportance(
    id: string,
    ownerId: string,
    importance: number,
    workspaceId?: string,
  ): Promise<Memory | null> {
    const existing = await this.reader.findById(id, ownerId, workspaceId);
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
    const existing = await this.reader.findById(id, ownerId, workspaceId);
    if (!existing) return null;

    const updatedAt = nowISO();
    const conditions = ['id = ?', 'owner_id = ?'];
    const params: unknown[] = [state, updatedAt, id, ownerId];
    appendWorkspaceFilter(conditions, params, workspaceId);

    await this.db.execute(
      `UPDATE memories SET lifecycle_state = ?, updated_at = ? WHERE ${conditions.join(' AND ')}`,
      params,
    );

    return {
      ...existing,
      lifecycleState: state as MemoryLifecycleState,
      updatedAt,
    };
  }
}
