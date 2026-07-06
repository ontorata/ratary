import 'dotenv/config';
import { watch } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { getEnv } from '../src/config/index.js';
import { createSqlDatabase } from '../src/infrastructure/composition/create-sql-database.js';
import { createMemoryService } from '../src/services/create-memory-service.js';
import type { MemoryService } from '../src/services/memory.service.js';
import { getMcpMemoryScope } from '../src/types/memory-scope.js';
import { getD1Client } from '../src/db/index.js';
import {
  collectSyncCandidates,
  ensureBackupRoot,
  fileToMemories,
  isSyncableFile,
  isSyncWatchPath,
} from './lib/backup-import.js';
import {
  getSyncedState,
  hashFileContent,
  loadSyncState,
  normalizeRelPath,
  saveSyncState,
  setSyncedState,
  type SyncStateFile,
} from './lib/sync-state.js';
import { formatScriptError } from './lib/cli-error.js';

const BACKUP_ROOT = resolve(process.env.BACKUP_ROOT ?? 'D:/Apps/_backups');
const DEBOUNCE_MS = Number(process.env.BACKUP_SYNC_DEBOUNCE_MS ?? 3000);
const POLL_MS = Number(process.env.BACKUP_SYNC_POLL_MS ?? 30_000);

const ONCE = process.argv.includes('--once');
const WATCH = process.argv.includes('--watch');
const POLL = process.argv.includes('--poll');
const FULL_SCAN = process.argv.includes('--full-scan');
const DRY_RUN = process.argv.includes('--dry-run');

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

const FILE_ARG = getArgValue('--file');

const debounceTimers = new Map<string, NodeJS.Timeout>();
let syncing = false;
const queue = new Set<string>();

function log(message: string): void {
  const time = new Date().toISOString().slice(11, 19);
  console.log(`[${time}] ${message}`);
}

const MEMORY_SCOPE = getMcpMemoryScope();

function createSyncMemoryService(): MemoryService {
  const env = getEnv();
  const d1 = env.SQL_PROVIDER === 'd1' ? getD1Client() : null;
  const sql = createSqlDatabase(d1, env);
  return createMemoryService(sql);
}

async function findExistingMemoryIds(service: MemoryService, relPath: string): Promise<string[]> {
  const { memories } = await service.listMemories(MEMORY_SCOPE, { limit: 100, offset: 0 });

  return memories
    .filter(
      (m) =>
        m.content.includes(`\`${relPath}\``) || m.content.includes(relPath.replace(/\//g, '\\')),
    )
    .map((m) => m.id);
}

async function deleteOldMemories(service: MemoryService, memoryIds: string[]): Promise<void> {
  for (const id of memoryIds) {
    try {
      await service.deleteMemory(MEMORY_SCOPE, id);
    } catch {
      // Memory mungkin sudah dihapus manual
    }
  }
}

async function syncOneFile(
  filePath: string,
  state: SyncStateFile,
  service: MemoryService,
): Promise<'skipped' | 'synced' | 'unchanged'> {
  const resolved = resolve(filePath);

  try {
    const fileStat = await stat(resolved);
    if (!fileStat.isFile()) return 'skipped';
  } catch {
    return 'skipped';
  }

  if (!isSyncableFile(resolved)) return 'skipped';
  if (!isSyncWatchPath(resolved, BACKUP_ROOT)) return 'skipped';

  const relPath = normalizeRelPath(BACKUP_ROOT, resolved);
  const contentHash = await hashFileContent(resolved);
  const previous = getSyncedState(state, relPath);

  if (previous?.contentHash === contentHash) {
    return 'unchanged';
  }

  if (!previous && !DRY_RUN) {
    const existingIds = await findExistingMemoryIds(service, relPath);
    if (existingIds.length > 0) {
      setSyncedState(state, relPath, {
        contentHash,
        memoryIds: existingIds,
        syncedAt: new Date().toISOString(),
        title: relPath.split('/').pop() ?? relPath,
      });
      log(`↻ ${relPath} sudah ada di DB (${existingIds.length} memory), state di-bootstrap`);
      return 'unchanged';
    }
  }

  const memories = await fileToMemories(resolved, BACKUP_ROOT);
  if (memories.length === 0) return 'skipped';

  if (DRY_RUN) {
    log(`[dry-run] ${relPath} → ${memories.length} memory`);
    return 'synced';
  }

  if (previous?.memoryIds.length) {
    await deleteOldMemories(service, previous.memoryIds);
  }

  const memoryIds: string[] = [];
  for (const draft of memories) {
    const created = await service.createMemory(MEMORY_SCOPE, {
      title: draft.title,
      project: draft.project,
      content: draft.content,
      summary: draft.summary,
      tags: draft.tags,
      favorite: false,
    });
    memoryIds.push(created.id);
  }

  setSyncedState(state, relPath, {
    contentHash,
    memoryIds,
    syncedAt: new Date().toISOString(),
    title: memories[0]!.title,
  });

  log(`✓ ${relPath} → ${memories.length} memory (${memories[0]!.title})`);
  return 'synced';
}

async function runSync(files?: string[]): Promise<void> {
  if (syncing) return;
  syncing = true;

  try {
    await ensureBackupRoot(BACKUP_ROOT);
    const state = await loadSyncState();
    state.backupRoot = BACKUP_ROOT;

    const service = DRY_RUN ? null : createSyncMemoryService();
    let synced = 0;
    let skipped = 0;
    let unchanged = 0;

    const targets =
      files ??
      (FULL_SCAN
        ? (await collectSyncCandidates(BACKUP_ROOT)).map((c) => c.filePath)
        : (await collectSyncCandidates(BACKUP_ROOT)).map((c) => c.filePath));

    for (const filePath of targets) {
      const result = await syncOneFile(filePath, state, service as MemoryService);
      if (result === 'synced') synced++;
      else if (result === 'unchanged') unchanged++;
      else skipped++;
    }

    if (!DRY_RUN) {
      await saveSyncState(state);
    }

    if (targets.length > 0) {
      log(`Selesai: ${synced} disinkronkan, ${unchanged} sudah mutakhir, ${skipped} dilewati`);
    }
  } finally {
    syncing = false;

    if (queue.size > 0) {
      const next = Array.from(queue);
      queue.clear();
      await runSync(next);
    }
  }
}

function scheduleSync(filePath: string): void {
  const resolved = resolve(filePath);
  const existing = debounceTimers.get(resolved);
  if (existing) clearTimeout(existing);

  debounceTimers.set(
    resolved,
    setTimeout(() => {
      debounceTimers.delete(resolved);
      queue.add(resolved);
      void runSync([resolved]);
    }, DEBOUNCE_MS),
  );
}

async function watchBackupRoot(): Promise<void> {
  log(`Memantau folder: ${BACKUP_ROOT}`);
  log(`Target: chat-*, cursor-chats/latest, *.md di root`);
  log(`Debounce: ${DEBOUNCE_MS}ms | Tekan Ctrl+C untuk berhenti`);

  await runSync();

  watch(BACKUP_ROOT, { recursive: true }, (_eventType, filename) => {
    if (!filename) return;
    const fullPath = join(BACKUP_ROOT, filename);
    if (isSyncableFile(fullPath) && isSyncWatchPath(fullPath, BACKUP_ROOT)) {
      scheduleSync(fullPath);
    }
  });
}

async function pollBackupRoot(): Promise<void> {
  log(`Polling folder: ${BACKUP_ROOT} setiap ${POLL_MS}ms`);
  await runSync();
  setInterval(() => {
    void runSync();
  }, POLL_MS);
}

async function syncSingleFile(filePath: string): Promise<void> {
  log(`Sinkron file: ${filePath}`);
  await runSync([resolve(filePath)]);
}

async function main(): Promise<void> {
  if (FILE_ARG) {
    await syncSingleFile(FILE_ARG);
    return;
  }

  if (WATCH) {
    await watchBackupRoot();
    return;
  }

  if (POLL) {
    await pollBackupRoot();
    return;
  }

  if (ONCE || (!WATCH && !POLL && !FILE_ARG)) {
    log(`Scan sekali: ${BACKUP_ROOT}`);
    await runSync();
    return;
  }
}

main().catch((error: unknown) => {
  console.error('Sync gagal:', formatScriptError(error));
  process.exit(1);
});
