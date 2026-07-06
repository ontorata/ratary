import 'dotenv/config';
import { resolve } from 'node:path';
import { createMemoryService } from '../src/services/create-memory-service.js';
import { getMcpMemoryScope } from '../src/types/memory-scope.js';
import { getD1Client } from '../src/db/index.js';
import { parseTranscriptFile } from './lib/transcript-parser.js';
import {
  collectCandidates,
  dedupeCandidates,
  ensureBackupRoot,
  fileToMemories,
  type MemoryDraft,
} from './lib/backup-import.js';

const BACKUP_ROOT = process.env.BACKUP_ROOT ?? 'D:/Apps/_backups';
const DRY_RUN = process.argv.includes('--dry-run');
const INCLUDE_JSONL = process.argv.includes('--include-jsonl');
const TRANSCRIPTS_ONLY = process.argv.includes('--transcripts-only');
const BATCH_SIZE = 20;

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

const FILE_ARG = getArgValue('--file');
const DIR_ARG = getArgValue('--dir');
const PROJECT_OVERRIDE = getArgValue('--project');
const TAG_OVERRIDE = getArgValue('--tag');
const ALL_FILES = process.argv.includes('--all-files');

const MEMORY_SCOPE = getMcpMemoryScope();

function applyImportOverrides(memories: MemoryDraft[]): MemoryDraft[] {
  return memories.map((m) => ({
    ...m,
    project: PROJECT_OVERRIDE ?? m.project,
    tags: TAG_OVERRIDE ? [...new Set([...m.tags, TAG_OVERRIDE])] : m.tags,
  }));
}

async function importMemories(memories: MemoryDraft[]): Promise<number> {
  if (DRY_RUN) return memories.length;

  const service = createMemoryService(getD1Client());
  let imported = 0;

  for (let i = 0; i < memories.length; i += BATCH_SIZE) {
    const batch = memories.slice(i, i + BATCH_SIZE);
    const result = await service.importBackup(MEMORY_SCOPE, {
      memories: batch.map((m) => ({
        title: m.title.slice(0, 500),
        project: m.project,
        content: m.content,
        summary: m.summary.slice(0, 300),
        tags: m.tags,
        favorite: false,
        archived: false,
      })),
    });
    imported += result.imported;
    console.log(`Imported batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.imported} memories`);
  }

  return imported;
}

async function importSingleTranscript(filePath: string): Promise<void> {
  const resolved = resolve(filePath);
  console.log(`Parsing transcript: ${resolved}`);
  console.log(DRY_RUN ? 'Mode: DRY RUN\n' : 'Mode: IMPORT ke D1\n');

  const transcriptMemories = await parseTranscriptFile(resolved);
  console.log(`Diekstrak ${transcriptMemories.length} memory dari transcript\n`);

  for (const m of transcriptMemories) {
    console.log(`  [${m.project}] ${m.title}`);
  }

  if (DRY_RUN) {
    console.log(`\nDry run selesai. Jalankan tanpa --dry-run untuk import.`);
    return;
  }

  const imported = await importMemories(transcriptMemories);
  console.log(`\nSelesai! ${imported} memories diimport.`);
}

async function importFromDirectory(root: string): Promise<void> {
  console.log(`Scanning: ${root}`);
  if (INCLUDE_JSONL) console.log('Termasuk: agent transcript (.jsonl)');
  if (TRANSCRIPTS_ONLY) console.log('Hanya: agent transcript (.jsonl)');
  if (ALL_FILES) console.log('Mode: semua file markdown (tanpa dedupe per folder)');
  if (PROJECT_OVERRIDE) console.log(`Project override: ${PROJECT_OVERRIDE}`);
  console.log(DRY_RUN ? 'Mode: DRY RUN (tidak import ke D1)\n' : 'Mode: IMPORT ke D1\n');

  await ensureBackupRoot(root);

  let candidates = await collectCandidates(root, root, INCLUDE_JSONL || TRANSCRIPTS_ONLY);

  if (!ALL_FILES) {
    candidates = dedupeCandidates(candidates);
  }

  candidates = candidates.filter((c) => !TRANSCRIPTS_ONLY || c.kind === 'transcript');

  console.log(`Found ${candidates.length} files to import\n`);

  const memories: MemoryDraft[] = [];
  for (const candidate of candidates) {
    const parts = applyImportOverrides(await fileToMemories(candidate.filePath, root));
    memories.push(...parts);
    for (const m of parts) {
      console.log(`  [${m.project}] ${m.title}`);
    }
  }

  if (DRY_RUN) {
    console.log(`\nDry run selesai. ${memories.length} memories siap diimport.`);
    return;
  }

  const imported = await importMemories(memories);
  console.log(`\nSelesai! ${imported} memories diimport ke Cloudflare D1.`);
}

async function importFromBackupRoot(): Promise<void> {
  await importFromDirectory(BACKUP_ROOT);
}

async function main(): Promise<void> {
  if (FILE_ARG) {
    if (FILE_ARG.endsWith('.jsonl')) {
      await importSingleTranscript(FILE_ARG);
      return;
    }

    const root = DIR_ARG ? resolve(DIR_ARG) : BACKUP_ROOT;
    const memories = applyImportOverrides(await fileToMemories(resolve(FILE_ARG), root));
    for (const m of memories) console.log(`  [${m.project}] ${m.title}`);
    const imported = await importMemories(memories);
    console.log(`\nSelesai! ${imported} memories diimport.`);
    return;
  }

  if (DIR_ARG) {
    await importFromDirectory(resolve(DIR_ARG));
    return;
  }

  await importFromBackupRoot();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Import gagal:', message);
  process.exit(1);
});
