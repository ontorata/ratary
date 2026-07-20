/**
 * Decision provenance types — Phase 36 / ADR-069.
 *
 * Invariants:
 * - I0: flag-off retrieval byte-parity
 * - I1: provenance edges are append-only (supersedes never deletes history)
 * - I2: every provenance edge metadata carries provenanceVersion + rule
 *       (supersedes also requires conflictKind)
 */
import { z } from 'zod';
import type { RelationType } from './knowledge.js';

export const PROVENANCE_RELATION_TYPES = [
  'motivated_by',
  'caused_by',
  'resulted_in',
  'supersedes',
] as const;

export const CONFLICT_KINDS = ['mutually_exclusive', 'temporal', 'granularity'] as const;

export const PROVENANCE_RULES = ['authored', 'depends_on_candidate'] as const;

/** Bumped only when provenance evidence contract changes (I2). */
export const PROVENANCE_VERSION = '1.0';

export type ProvenanceRelationType = (typeof PROVENANCE_RELATION_TYPES)[number];
export type ConflictKind = (typeof CONFLICT_KINDS)[number];
export type ProvenanceRule = (typeof PROVENANCE_RULES)[number];

export const provenanceRelationTypeSchema = z.enum(PROVENANCE_RELATION_TYPES);
export const conflictKindSchema = z.enum(CONFLICT_KINDS);
export const provenanceRuleSchema = z.enum(PROVENANCE_RULES);

export const provenanceEvidenceSchema = z
  .object({
    provenanceVersion: z.string().min(1),
    rule: provenanceRuleSchema,
    matched: z.string().optional(),
    conflictKind: conflictKindSchema.optional(),
    evidenceRefs: z.array(z.string().min(1)).optional(),
  })
  .passthrough();

export type ProvenanceEvidence = z.infer<typeof provenanceEvidenceSchema>;

const PROVENANCE_SET = new Set<string>(PROVENANCE_RELATION_TYPES);

export function isProvenanceRelationType(relation: string): relation is ProvenanceRelationType {
  return PROVENANCE_SET.has(relation);
}

/**
 * Normalize / validate metadata for a provenance-typed edge (I2).
 * Stamps provenanceVersion when missing; defaults rule to `authored`.
 * Rejects supersedes without conflictKind.
 */
export function enforceProvenanceMetadata(
  relation: RelationType,
  metadata: Record<string, unknown> = {},
): Record<string, unknown> {
  if (!isProvenanceRelationType(relation)) {
    return metadata;
  }

  const next: Record<string, unknown> = { ...metadata };
  if (typeof next.provenanceVersion !== 'string' || next.provenanceVersion.length === 0) {
    next.provenanceVersion = PROVENANCE_VERSION;
  }
  if (typeof next.rule !== 'string' || next.rule.length === 0) {
    next.rule = 'authored';
  }

  const parsed = provenanceEvidenceSchema.safeParse(next);
  if (!parsed.success) {
    throw new Error(`invalid provenance metadata: ${parsed.error.message}`);
  }

  if (relation === 'supersedes' && !parsed.data.conflictKind) {
    throw new Error('supersedes requires metadata.conflictKind');
  }

  return { ...next, ...parsed.data };
}
