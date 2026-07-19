/**
 * Phase 35 — canonical entity registry (ADR-068 D2).
 *
 * Owner-scoped CRUD over canonical entities and their alias index.
 *
 * Invariant I1: an entity's `id` is permanent. `updateMetadata` can change
 * canonical name, confidence, and aliases, but never re-keys — every
 * persisted mention stays valid across renames.
 */
import type { CanonicalEntity, EntityAlias, EntityKind } from '../../types/entities.js';

export interface CreateEntityInput {
  ownerId: string;
  canonicalName: string;
  kind: EntityKind;
  confidence?: number;
  sourceType?: string;
}

export interface UpdateEntityMetadataInput {
  canonicalName?: string;
  confidence?: number;
}

export interface IEntityRegistry {
  /** Idempotent on (ownerId, normalizedName, kind): returns the existing entity when already registered. */
  create(input: CreateEntityInput): Promise<CanonicalEntity>;

  findById(ownerId: string, entityId: string): Promise<CanonicalEntity | null>;

  findByNormalizedName(
    ownerId: string,
    normalizedName: string,
    kind?: EntityKind,
  ): Promise<CanonicalEntity | null>;

  /** Alias lookup — unique per (ownerId, normalizedAlias), so at most one entity. */
  findByNormalizedAlias(ownerId: string, normalizedAlias: string): Promise<CanonicalEntity | null>;

  /** Idempotent on (ownerId, normalizedAlias). */
  addAlias(ownerId: string, entityId: string, alias: string): Promise<EntityAlias>;

  listAliases(ownerId: string, entityId: string): Promise<EntityAlias[]>;

  /** Metadata-only update (I1) — the entity id can never change. */
  updateMetadata(
    ownerId: string,
    entityId: string,
    patch: UpdateEntityMetadataInput,
  ): Promise<CanonicalEntity>;

  listByOwner(ownerId: string): Promise<CanonicalEntity[]>;
}
