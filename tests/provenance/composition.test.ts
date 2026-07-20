/**
 * Phase 36 / ADR-069 T5 — composition returns disabled when flag off.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getEnv, resetEnvCache } from '../../src/config/env.js';
import { createProvenancePorts } from '../../src/composition/create-provenance-ports.js';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';

const TOUCHED = ['DECISION_PROVENANCE_ENABLED'] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of TOUCHED) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
  resetEnvCache();
});

afterEach(() => {
  for (const key of TOUCHED) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
  resetEnvCache();
});

describe('createProvenancePorts (ADR-069 D6)', () => {
  it('returns enabled:false by default (flag off)', () => {
    const db = new SqliteMemoryDatabase();
    const ports = createProvenancePorts(db, getEnv());
    expect(ports).toEqual({ enabled: false });
    db.close();
  });

  it('returns query adapter when flag on', () => {
    process.env.DECISION_PROVENANCE_ENABLED = 'true';
    resetEnvCache();
    const db = new SqliteMemoryDatabase();
    const ports = createProvenancePorts(db, getEnv());
    expect(ports.enabled).toBe(true);
    if (ports.enabled) {
      expect(ports.query).toBeDefined();
      expect(typeof ports.query.whyChain).toBe('function');
    }
    db.close();
  });
});
