import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';

export interface SyncedFileState {
  contentHash: string;
  memoryIds: string[];
  syncedAt: string;
  title: string;
}

export interface SyncStateFile {
  version: 1;
  backupRoot: string;
  files: Record<string, SyncedFileState>;
}

const STATE_PATH = resolve(process.cwd(), '.backup-sync-state.json');

export function normalizeRelPath(backupRoot: string, filePath: string): string {
  const rel = relative(resolve(backupRoot), resolve(filePath));
  return rel.replace(/\\/g, '/');
}

export async function hashFileContent(filePath: string): Promise<string> {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}

export async function loadSyncState(): Promise<SyncStateFile> {
  try {
    const raw = await readFile(STATE_PATH, 'utf-8');
    return JSON.parse(raw) as SyncStateFile;
  } catch {
    return { version: 1, backupRoot: '', files: {} };
  }
}

export async function saveSyncState(state: SyncStateFile): Promise<void> {
  await mkdir(dirname(STATE_PATH), { recursive: true });
  await writeFile(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, 'utf-8');
}

export function getSyncedState(state: SyncStateFile, relPath: string): SyncedFileState | undefined {
  return state.files[relPath];
}

export function setSyncedState(
  state: SyncStateFile,
  relPath: string,
  entry: SyncedFileState,
): void {
  state.files[relPath] = entry;
}
