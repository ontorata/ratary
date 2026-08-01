import { describe, expect, it } from 'vitest';
import {
  AREA6_HORIZON_MODULES,
  AREA6_OPS_BRIDGE_MODEL,
  getArea6OpsBridgeManifest,
  listArea6HorizonSlots,
} from './area6-ops-bridge-manifest.js';

describe('Area 6 Horizon ops bridge manifest (ADR-1050/1051/1056/1058)', () => {
  it('exposes Shape X cross-cutting ownership under ADR-1050 law', () => {
    const manifest = getArea6OpsBridgeManifest();
    expect(manifest.model).toBe(AREA6_OPS_BRIDGE_MODEL);
    expect(manifest.shape).toBe('X');
    expect(manifest.owner).toBe('cross-cutting');
    expect(manifest.law).toContain('ADR-1050');
    expect(manifest.law).toContain('ADR-015');
  });

  it('covers Horizon slots 1050, 1051, 1056, 1058 with living module paths', () => {
    expect(listArea6HorizonSlots().sort()).toEqual(['1050', '1051', '1056', '1058']);
    for (const mod of AREA6_HORIZON_MODULES) {
      expect(mod.modulePath.length).toBeGreaterThan(0);
      expect(['ratary', 'ontory-runtime']).toContain(mod.ownerRepo);
    }
  });

  it('rejects megamonitor / monorepo CI / 1053 reuse in nonGoals', () => {
    const joined = getArea6OpsBridgeManifest().nonGoals.join(' ');
    expect(joined).toMatch(/megamonitor|NOC/);
    expect(joined).toMatch(/monorepo CI/);
    expect(joined).toMatch(/1053/);
    expect(getArea6OpsBridgeManifest().partialElsewhere.some((p) => p.includes('1053'))).toBe(true);
  });
});
