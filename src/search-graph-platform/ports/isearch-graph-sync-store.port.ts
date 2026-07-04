import type {
  SearchGraphSyncRun,
  SearchGraphSyncState,
  SearchGraphSyncTarget,
} from '../types/sync.types.js';

export interface ISearchGraphSyncStore {
  startRun(run: Omit<SearchGraphSyncRun, 'finishedAt' | 'errorMessage'>): Promise<void>;
  completeRun(
    runId: string,
    update: Pick<SearchGraphSyncRun, 'status' | 'stats' | 'finishedAt' | 'errorMessage'>,
  ): Promise<void>;
  getState(target: SearchGraphSyncTarget): Promise<SearchGraphSyncState | null>;
  setWatermark(target: SearchGraphSyncTarget, watermark: string, runId: string): Promise<void>;
  listRuns(limit?: number): Promise<SearchGraphSyncRun[]>;
  getLatestRun(target: SearchGraphSyncTarget): Promise<SearchGraphSyncRun | null>;
}
