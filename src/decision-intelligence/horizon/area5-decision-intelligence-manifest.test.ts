import { describe, expect, it } from 'vitest';
import {
  AREA5_DECISION_INTELLIGENCE_MODEL,
  AREA5_HORIZON_MODULES,
  getArea5DecisionIntelligenceManifest,
  listArea5HorizonSlots,
} from './area5-decision-intelligence-manifest.js';

describe('Area 5 Horizon bridge manifest (ADR-1040…1046)', () => {
  it('exposes Shape D composed ownership under ADR-1040 law', () => {
    const manifest = getArea5DecisionIntelligenceManifest();
    expect(manifest.model).toBe(AREA5_DECISION_INTELLIGENCE_MODEL);
    expect(manifest.shape).toBe('D');
    expect(manifest.owner).toBe('composed');
    expect(manifest.law).toContain('ADR-1040');
    expect(manifest.law).toContain('ADR-069');
  });

  it('covers Horizon slots 1040–1044 and 1046 with living module paths', () => {
    expect(listArea5HorizonSlots().sort()).toEqual([
      '1040',
      '1041',
      '1042',
      '1043',
      '1044',
      '1046',
    ]);
    for (const mod of AREA5_HORIZON_MODULES) {
      expect(mod.modulePath.length).toBeGreaterThan(0);
      expect(['ratary', 'ontory-runtime']).toContain(mod.ownerRepo);
      if (mod.ownerRepo === 'ratary') {
        expect(mod.modulePath.startsWith('src/')).toBe(true);
      }
    }
  });

  it('rejects DI SoR / autonomous executive / P6 product PI in nonGoals', () => {
    const joined = getArea5DecisionIntelligenceManifest().nonGoals.join(' ');
    expect(joined).toMatch(/SoR/);
    expect(joined).toMatch(/Autonomous executive/);
    expect(joined).toMatch(/P6 product PI/);
    expect(getArea5DecisionIntelligenceManifest().partialElsewhere.length).toBeGreaterThan(0);
  });
});
