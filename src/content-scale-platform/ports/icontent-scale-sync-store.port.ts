import type {
  ContentScaleSyncRun,
  ContentScaleSyncState,
  ContentScaleSyncTarget,
} from '../types/sync.types.js';

export interface IContentScaleSyncStore {
  startRun(run: Omit<ContentScaleSyncRun, 'finishedAt' | 'errorMessage'>): Promise<void>;
  completeRun(
    runId: string,
    update: Pick<ContentScaleSyncRun, 'status' | 'stats' | 'finishedAt' | 'errorMessage'>,
  ): Promise<void>;
  getState(target: ContentScaleSyncTarget): Promise<ContentScaleSyncState | null>;
  setWatermark(target: ContentScaleSyncTarget, watermark: string, runId: string): Promise<void>;
  listRuns(limit?: number): Promise<ContentScaleSyncRun[]>;
  getLatestRun(target: ContentScaleSyncTarget): Promise<ContentScaleSyncRun | null>;
}
