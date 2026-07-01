import 'dotenv/config';
import { readFile, stat } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { MemoryRepository } from '../src/repositories/memory.repository.js';
import { MemoryService } from '../src/services/memory.service.js';
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

async function importMemories(memories: MemoryDraft[]): Promise<number> {
  if (DRY_RUN) return memories.length;

  const service = new MemoryService(new MemoryRepository(getD1Client()));
  let imported = 0;

  for (let i = 0; i < memories.length; i += BATCH_SIZE) {
    const batch = memories.slice(i, i + BATCH_SIZE);
    const result = await service.importBackup({
      memories: batch.map((m) => ({
        title: m.title,
        project: m.project,
        content: m.content,
        summary: m.summary,
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

async function importFromBackupRoot(): Promise<void> {
  console.log(`Scanning backups: ${BACKUP_ROOT}`);
  if (INCLUDE_JSONL) console.log('Termasuk: agent transcript (.jsonl)');
  if (TRANSCRIPTS_ONLY) console.log('Hanya: agent transcript (.jsonl)');
  console.log(DRY_RUN ? 'Mode: DRY RUN (tidak import ke D1)\n' : 'Mode: IMPORT ke D1\n');

  await ensureBackupRoot(BACKUP_ROOT);

  const candidates = dedupeCandidates(
    await collectCandidates(BACKUP_ROOT, BACKUP_ROOT, INCLUDE_JSONL || TRANSCRIPTS_ONLY),
  ).filter((c) => !TRANSCRIPTS_ONLY || c.kind === 'transcript');

  console.log(`Found ${candidates.length} backup files to import\n`);

  const memories: MemoryDraft[] = [];
  for (const candidate of candidates) {
    const parts = await fileToMemories(candidate.filePath, BACKUP_ROOT);
    memories.push(...parts);
    for (const m of parts) {
      console.log(`  [${m.project}] ${m.title}`);
    }
  }

  if (DRY_RUN) {
    console.log(`\nDry run selesai. ${memories.length} memories siap diimport.`);
    console.log('Jalankan: npm run import:backups -- --include-jsonl');
    return;
  }

  const imported = await importMemories(memories);
  console.log(`\nSelesai! ${imported} memories diimport ke Cloudflare D1.`);
  console.log(`Cek: GET https://ai-brain-beryl.vercel.app/memory`);
}

async function main(): Promise<void> {
  if (FILE_ARG) {
    if (FILE_ARG.endsWith('.jsonl')) {
      await importSingleTranscript(FILE_ARG);
      return;
    }

    const memories = await fileToMemories(resolve(FILE_ARG), BACKUP_ROOT);
    for (const m of memories) console.log(`  [${m.project}] ${m.title}`);
    const imported = await importMemories(memories);
    console.log(`\nSelesai! ${imported} memories diimport.`);
    return;
  }

  await importFromBackupRoot();
}

main().catch((error) => {
  console.error('Import gagal:', error);
  process.exit(1);
});
