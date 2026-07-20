/**
 * Phase 36 / ADR-069 — T1 contract: decision provenance flag defaults OFF and
 * the provenance type vocabulary + evidence schema (I2) are closed/validated.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getEnv, resetEnvCache } from '../../src/config/env.js';
import { RELATION_TYPES } from '../../src/types/knowledge.js';
import {
  CONFLICT_KINDS,
  PROVENANCE_RELATION_TYPES,
  PROVENANCE_RULES,
  PROVENANCE_VERSION,
  enforceProvenanceMetadata,
  isProvenanceRelationType,
  provenanceEvidenceSchema,
} from '../../src/types/provenance.js';

const TOUCHED_VARS = ['DECISION_PROVENANCE_ENABLED'] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of TOUCHED_VARS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
  resetEnvCache();
});

afterEach(() => {
  for (const key of TOUCHED_VARS) {
    if (saved[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = saved[key];
    }
  }
  resetEnvCache();
});

describe('decision provenance env flag (ADR-069 D6)', () => {
  it('defaults to disabled', () => {
    const env = getEnv();
    expect(env.DECISION_PROVENANCE_ENABLED).toBe(false);
  });

  it('accepts enabled flag', () => {
    process.env.DECISION_PROVENANCE_ENABLED = 'true';
    resetEnvCache();
    expect(getEnv().DECISION_PROVENANCE_ENABLED).toBe(true);
  });
});

describe('provenance type vocabulary (ADR-069 D1 / I2)', () => {
  it('extends RELATION_TYPES with the four provenance members', () => {
    expect(PROVENANCE_RELATION_TYPES).toEqual([
      'motivated_by',
      'caused_by',
      'resulted_in',
      'supersedes',
    ]);
    for (const type of PROVENANCE_RELATION_TYPES) {
      expect(RELATION_TYPES).toContain(type);
      expect(isProvenanceRelationType(type)).toBe(true);
    }
    expect(isProvenanceRelationType('depends_on')).toBe(false);
  });

  it('keeps versioned rules and conflict kinds closed', () => {
    expect(PROVENANCE_VERSION).toBe('1.0');
    expect(PROVENANCE_RULES).toEqual(['authored', 'depends_on_candidate']);
    expect(CONFLICT_KINDS).toEqual(['mutually_exclusive', 'temporal', 'granularity']);
  });

  it('evidence schema requires provenanceVersion and rule (I2)', () => {
    const valid = provenanceEvidenceSchema.safeParse({
      provenanceVersion: PROVENANCE_VERSION,
      rule: 'authored',
    });
    expect(valid.success).toBe(true);

    const missingRule = provenanceEvidenceSchema.safeParse({
      provenanceVersion: PROVENANCE_VERSION,
    });
    expect(missingRule.success).toBe(false);
  });

  it('enforceProvenanceMetadata stamps defaults and rejects supersedes without conflictKind', () => {
    const stamped = enforceProvenanceMetadata('caused_by', {});
    expect(stamped.provenanceVersion).toBe(PROVENANCE_VERSION);
    expect(stamped.rule).toBe('authored');

    expect(() => enforceProvenanceMetadata('supersedes', {})).toThrowError(/conflictKind/);

    const supersedes = enforceProvenanceMetadata('supersedes', {
      conflictKind: 'temporal',
    });
    expect(supersedes.conflictKind).toBe('temporal');
    expect(supersedes.provenanceVersion).toBe(PROVENANCE_VERSION);

    expect(enforceProvenanceMetadata('depends_on', { foo: 1 })).toEqual({ foo: 1 });
  });
});
