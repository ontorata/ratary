/**
 * Canonical entity resolution types — Phase 35 / ADR-068.
 *
 * Invariants:
 * - I1: `CanonicalEntity.id` is permanent. Only metadata (canonicalName,
 *   aliases, confidence) may change; mentions are never re-keyed.
 * - I2: every resolution result carries `resolverVersion` + `rule` inside
 *   its evidence so old results stay replayable across resolver versions.
 *
 * Entity kinds are a closed vocabulary separate from MEMORY_TYPES (owner
 * decision E1): memories classify artifacts, entities classify referents.
 */
import { z } from 'zod';

export const ENTITY_KINDS = [
  'project',
  'component',
  'person',
  'organization',
  'concept',
  'technology',
] as const;

/** Structured memory fields entity mentions may originate from (E6). */
export const ENTITY_MENTION_FIELDS = ['codename', 'tag', 'keyword'] as const;

/** Deterministic resolution rules, ordered by precedence (ADR-068 D3). */
export const ENTITY_RESOLUTION_RULES = ['canonical_exact', 'alias_exact'] as const;

/** Bumped only when the deterministic rule set changes (I2). */
export const RESOLVER_VERSION = '1.0';

export type EntityKind = (typeof ENTITY_KINDS)[number];
export type EntityMentionField = (typeof ENTITY_MENTION_FIELDS)[number];
export type EntityResolutionRule = (typeof ENTITY_RESOLUTION_RULES)[number];

export const entityKindSchema = z.enum(ENTITY_KINDS);
export const entityMentionFieldSchema = z.enum(ENTITY_MENTION_FIELDS);
export const entityResolutionRuleSchema = z.enum(ENTITY_RESOLUTION_RULES);

export interface CanonicalEntity {
  /** Permanent identity (I1) — never changes after creation. */
  id: string;
  ownerId: string;
  canonicalName: string;
  /** Deterministic normalization of canonicalName (NFKC, lowercase, collapsed separators). */
  normalizedName: string;
  kind: EntityKind;
  confidence: number;
  sourceType: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntityAlias {
  id: string;
  ownerId: string;
  entityId: string;
  alias: string;
  normalizedAlias: string;
  sourceType: string;
  createdAt: string;
}

/** Evidence attached to every mention (I2). */
export interface EntityResolutionEvidence {
  resolverVersion: string;
  rule: EntityResolutionRule;
  /** The raw symbol that matched, e.g. "ADR-068". */
  matched: string;
  [key: string]: unknown;
}

export interface EntityMention {
  id: string;
  ownerId: string;
  memoryId: string;
  entityId: string;
  field: EntityMentionField;
  confidence: number;
  evidence: EntityResolutionEvidence;
  sourceType: string;
  createdAt: string;
}

export const entityResolutionEvidenceSchema = z
  .object({
    resolverVersion: z.string().min(1),
    rule: entityResolutionRuleSchema,
    matched: z.string().min(1),
  })
  .passthrough();

export const canonicalEntitySchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  canonicalName: z.string().min(1).max(300),
  normalizedName: z.string().min(1).max(300),
  kind: entityKindSchema,
  confidence: z.number().min(0).max(1),
  sourceType: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const entityMentionSchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  memoryId: z.string().min(1),
  entityId: z.string().min(1),
  field: entityMentionFieldSchema,
  confidence: z.number().min(0).max(1),
  evidence: entityResolutionEvidenceSchema,
  sourceType: z.string().min(1),
  createdAt: z.string().min(1),
});
