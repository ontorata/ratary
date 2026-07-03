import type {
  AnalyticsQuery,
  AnalyticsRow,
  IAnalyticsStore,
} from '../../ports/analytics/ianalytics-store.port.js';

export class NoOpAnalyticsStore implements IAnalyticsStore {
  async insert(_table: string, _rows: readonly Record<string, unknown>[]): Promise<void> {}

  async query(_query: AnalyticsQuery): Promise<AnalyticsRow[]> {
    return [];
  }
}
