/**
 * Phase 35 — entity mention edges (ADR-068 D1/D5).
 *
 * Mentions connect memories to canonical entities in a dedicated table —
 * `memory_relations` stays memory↔memory (owner decision E5). Upserts are
 * idempotent on (ownerId, memoryId, entityId, field).
 */
import type { EntityMention } from '../../types/entities.js';

export type UpsertEntityMentionInput = Omit<EntityMention, 'id' | 'createdAt'>;

export interface IEntityMentionStore {
  /** Idempotent on the unique mention key; returns true when a new row was inserted. */
  upsert(mention: UpsertEntityMentionInput): Promise<boolean>;

  /**
   * Memories mentioning any of the given entities, deterministically ordered
   * (confidence DESC, memory_id ASC) per ADR-068 D5.
   */
  findByEntityIds(ownerId: string, entityIds: readonly string[]): Promise<EntityMention[]>;

  findByMemoryId(ownerId: string, memoryId: string): Promise<EntityMention[]>;

  countByOwner(ownerId: string): Promise<number>;
}
