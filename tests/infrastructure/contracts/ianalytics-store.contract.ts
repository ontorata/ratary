import { describe, it, expect } from 'vitest';
import type { IAnalyticsStore } from '../../../src/ports/analytics/ianalytics-store.port.js';

export function describeAnalyticsStoreContract(
  label: string,
  createStore: () => IAnalyticsStore,
): void {
  describe(`IAnalyticsStore contract — ${label}`, () => {
    it('should insert and query rows', async () => {
      const store = createStore();
      await store.insert('memory_access_events', [
        {
          id: 'evt-1',
          owner_id: 'owner-a',
          memory_id: 'mem-1',
          accessed_at: '2026-01-01T00:00:00.000Z',
        },
      ]);

      const rows = await store.query({
        name: 'access_count_by_owner',
        params: { ownerId: 'owner-a' },
      });

      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0]!.columns.access_count).toBeGreaterThan(0);
    });
  });
}
