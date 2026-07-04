import { describe, it, expect } from 'vitest';
import { migrateGlobalIntelligencePhase1 } from '../../src/db/migrations.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('Global intelligence migration', () => {
  it('migrateGlobalIntelligencePhase1 runs without error', async () => {
    await expect(migrateGlobalIntelligencePhase1(new MockD1Client())).resolves.toBeUndefined();
  });
});
