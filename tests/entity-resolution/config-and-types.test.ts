/**
 * Phase 35 / ADR-068 — T1 contract: entity resolution flags default OFF and
 * the type vocabulary is closed and validated.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getEnv, resetEnvCache } from '../../src/config/env.js';
import {
  ENTITY_KINDS,
  ENTITY_MENTION_FIELDS,
  ENTITY_RESOLUTION_RULES,
  RESOLVER_VERSION,
  canonicalEntitySchema,
  entityMentionSchema,
  entityResolutionEvidenceSchema,
} from '../../src/types/entities.js';

const TOUCHED_VARS = ['ENTITY_RESOLUTION_ENABLED', 'ENTITY_STORE_PROVIDER'] as const;
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

describe('entity resolution env flags (ADR-068 D7)', () => {
  it('defaults to disabled with no store provider', () => {
    const env = getEnv();
    expect(env.ENTITY_RESOLUTION_ENABLED).toBe(false);
    expect(env.ENTITY_STORE_PROVIDER).toBe('none');
  });

  it('rejects enabled flag without a sql store provider', () => {
    process.env.ENTITY_RESOLUTION_ENABLED = 'true';
    resetEnvCache();
    expect(() => getEnv()).toThrowError(/ENTITY_STORE_PROVIDER/);
  });

  it('accepts enabled flag with sql store provider', () => {
    process.env.ENTITY_RESOLUTION_ENABLED = 'true';
    process.env.ENTITY_STORE_PROVIDER = 'sql';
    resetEnvCache();
    const env = getEnv();
    expect(env.ENTITY_RESOLUTION_ENABLED).toBe(true);
    expect(env.ENTITY_STORE_PROVIDER).toBe('sql');
  });
});

describe('entity type vocabulary (owner decisions E1/E6, invariant I2)', () => {
  it('kind vocabulary is the E1 closed set, separate from MEMORY_TYPES', () => {
    expect(ENTITY_KINDS).toEqual([
      'project',
      'component',
      'person',
      'organization',
      'concept',
      'technology',
    ]);
  });

  it('mention fields are structured-only (E6 — no title/content)', () => {
    expect(ENTITY_MENTION_FIELDS).toEqual(['codename', 'tag', 'keyword']);
  });

  it('resolver is versioned and rules are a closed ordered set (I2, D3)', () => {
    expect(RESOLVER_VERSION).toBe('1.0');
    expect(ENTITY_RESOLUTION_RULES).toEqual(['canonical_exact', 'alias_exact']);
  });

  it('evidence schema requires resolverVersion, rule, and matched (I2)', () => {
    const valid = entityResolutionEvidenceSchema.safeParse({
      resolverVersion: RESOLVER_VERSION,
      rule: 'alias_exact',
      matched: 'ADR-068',
    });
    expect(valid.success).toBe(true);

    const missingRule = entityResolutionEvidenceSchema.safeParse({
      resolverVersion: RESOLVER_VERSION,
      matched: 'ADR-068',
    });
    expect(missingRule.success).toBe(false);
  });

  it('canonical entity and mention schemas round-trip a valid record', () => {
    const now = new Date().toISOString();
    const entity = {
      id: 'ent-1',
      ownerId: 'owner-1',
      canonicalName: 'Ratary',
      normalizedName: 'ratary',
      kind: 'project',
      confidence: 1,
      sourceType: 'inferred',
      createdAt: now,
      updatedAt: now,
    };
    expect(canonicalEntitySchema.parse(entity)).toEqual(entity);

    const mention = {
      id: 'men-1',
      ownerId: 'owner-1',
      memoryId: 'mem-1',
      entityId: 'ent-1',
      field: 'codename',
      confidence: 1,
      evidence: {
        resolverVersion: RESOLVER_VERSION,
        rule: 'canonical_exact',
        matched: 'Ratary',
      },
      sourceType: 'inferred',
      createdAt: now,
    };
    expect(entityMentionSchema.parse(mention)).toEqual(mention);

    const badKind = canonicalEntitySchema.safeParse({ ...entity, kind: 'note' });
    expect(badKind.success).toBe(false);
  });
});
