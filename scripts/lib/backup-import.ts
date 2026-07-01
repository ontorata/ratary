import { readFile, readdir, stat } from 'node:fs/promises';
import { join, basename, dirname, relative, resolve } from 'node:path';
import { parseTranscriptFile, isMainTranscript } from './transcript-parser.js';

export interface BackupCandidate {
  filePath: string;
  folderName: string;
  priority: number;
  kind: 'markdown' | 'transcript';
}

export interface MemoryDraft {
  title: string;
  project: string;
  content: string;
  summary: string;
  tags: string[];
}

const SKIP_DIRS = new Set(['subagents', 'node_modules']);

const SKIP_FILE_PATTERNS = [/^git-/i, /^INDEX\.md$/i, /^LATEST\.txt$/i];

export function isTranscriptJsonl(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  if (normalized.includes('/subagents/')) return false;
  return /\.jsonl$/i.test(filePath);
}

export function shouldSkipFile(name: string, includeJsonl: boolean): boolean {
  if (/\.jsonl$/i.test(name)) return !includeJsonl;
  return SKIP_FILE_PATTERNS.some((p) => p.test(name));
}

export function isSyncableFile(filePath: string): boolean {
  const name = basename(filePath);
  if (shouldSkipFile(name, true)) return false;
  if (isTranscriptJsonl(filePath)) return true;
  return /\.(md|markdown)$/i.test(name);
}

function folderToTitle(folderName: string): string {
  if (folderName.endsWith('.md')) {
    return folderName
      .replace(/\.md$/i, '')
      .replace(/^chat-session-/i, '')
      .replace(/_/g, ' ')
      .replace(/-/g, ' ');
  }

  return folderName
    .replace(/^chat-/i, '')
    .replace(/_\d{4}-\d{2}-\d{2}_\d{4}$/, '')
    .replace(/_\d{4}-\d{2}-\d{2}$/, '')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ');
}

function folderToTags(folderName: string): string[] {
  const raw = folderName
    .replace(/^chat-/i, '')
    .replace(/\.md$/i, '')
    .replace(/_\d{4}-\d{2}-\d{2}.*$/, '')
    .split(/[-_]+/)
    .filter((t) => t.length > 2 && !/^\d+$/.test(t));

  const tags = new Set<string>(['backup', 'cursor-chat', 'auto-sync']);
  for (const t of raw) tags.add(t.toLowerCase());
  return Array.from(tags).slice(0, 10);
}

function detectProject(content: string, folderName: string): string {
  const text = `${content}\n${folderName}`.toLowerCase();

  if (text.includes('ai-brain') || text.includes('ai memory cloud')) return 'ai-brain';
  if (text.includes('geo-fastify')) return 'geo-fastify';
  if (text.includes('mangroveapps') || text.includes('mangrove')) return 'MangroveApps';
  if (text.includes('sippem')) return 'sippem';
  if (text.includes('webos')) return 'webos';
  if (text.includes('geoportal')) return 'geoportal';
  if (text.includes('klm')) return 'klm';

  return 'general';
}

function extractSummary(content: string): string {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);

  for (const line of lines) {
    const trimmed = line.replace(/^#+\s*/, '').trim();
    if (
      trimmed &&
      !trimmed.startsWith('**') &&
      !trimmed.startsWith('|') &&
      !trimmed.startsWith('-') &&
      trimmed.length > 20
    ) {
      return trimmed.slice(0, 500);
    }
  }

  return lines.slice(0, 3).join(' ').slice(0, 500);
}

function extractTitleFromContent(content: string, fallback: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].replace(/\*\*/g, '').trim().slice(0, 200);
  }
  return fallback.slice(0, 200);
}

export function candidateFromPath(filePath: string, backupRoot: string): BackupCandidate | null {
  const name = basename(filePath);
  if (!isSyncableFile(filePath)) return null;

  const folderName = basename(dirname(filePath));
  const isRootMd = dirname(filePath) === backupRoot;

  if (isTranscriptJsonl(filePath)) {
    if (!isMainTranscript(filePath) && name !== 'transcript.jsonl') {
      // UUID.jsonl di folder chat-* tetap diimport
      if (!/^[0-9a-f-]{36}\.jsonl$/i.test(name)) return null;
    }

    return {
      filePath,
      folderName: isMainTranscript(filePath)
        ? name.replace(/\.jsonl$/i, '')
        : folderName,
      priority: 5,
      kind: 'transcript',
    };
  }

  let priority = 1;
  if (name === 'RINGKASAN.md') priority = 10;
  else if (name === 'README.md') priority = 8;
  else if (name === 'CONTEXT-HANDOFF.md') priority = 9;
  else if (isRootMd) priority = 7;
  else if (name.startsWith('chat-session')) priority = 6;

  return {
    filePath,
    folderName: isRootMd ? name : folderName,
    priority,
    kind: 'markdown',
  };
}

export async function collectCandidates(
  dir: string,
  backupRoot: string,
  includeJsonl: boolean,
): Promise<BackupCandidate[]> {
  const candidates: BackupCandidate[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(current, entry.name);

      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        await walk(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;
      if (shouldSkipFile(entry.name, includeJsonl)) continue;

      const rel = relative(backupRoot, fullPath);
      if (!includeJsonl && (rel.includes('cursor-chats\\') || rel.includes('cursor-chats/'))) {
        if (!/\.(md|markdown)$/i.test(entry.name)) continue;
        if (rel.includes('cursor-chats\\') || rel.includes('cursor-chats/')) continue;
      }

      const candidate = candidateFromPath(fullPath, backupRoot);
      if (candidate) candidates.push(candidate);
    }
  }

  await walk(dir);
  return candidates;
}

export function dedupeCandidates(candidates: BackupCandidate[]): BackupCandidate[] {
  const byFolder = new Map<string, BackupCandidate>();

  for (const c of candidates.sort((a, b) => b.priority - a.priority)) {
    const key = c.folderName.toLowerCase();
    if (!byFolder.has(key)) {
      byFolder.set(key, c);
    }
  }

  return Array.from(byFolder.values()).sort((a, b) => a.folderName.localeCompare(b.folderName));
}

async function markdownToMemory(
  candidate: BackupCandidate,
  backupRoot: string,
): Promise<MemoryDraft> {
  const content = await readFile(candidate.filePath, 'utf-8');
  const relPath = relative(backupRoot, candidate.filePath).replace(/\\/g, '/');
  const fallbackTitle = folderToTitle(candidate.folderName);
  const title = extractTitleFromContent(content, fallbackTitle);

  const fullContent = `# ${title}

> Sumber backup: \`${relPath}\`
> Folder: \`${candidate.folderName}\`
> Sinkron: otomatis

${content}`;

  return {
    title,
    project: detectProject(content, candidate.folderName),
    content: fullContent,
    summary: extractSummary(content),
    tags: folderToTags(candidate.folderName),
  };
}

export async function fileToMemories(
  filePath: string,
  backupRoot: string,
): Promise<MemoryDraft[]> {
  const candidate = candidateFromPath(filePath, backupRoot);
  if (!candidate) return [];

  if (candidate.kind === 'transcript') {
    const parts = await parseTranscriptFile(candidate.filePath);
    return parts.map((m) => ({
      title: m.title,
      project: m.project,
      content: m.content.replace(
        '> **Tipe:** Agent transcript (JSONL)',
        '> **Tipe:** Agent transcript (JSONL)\n> **Sinkron:** otomatis',
      ),
      summary: m.summary,
      tags: [...new Set([...m.tags, 'auto-sync'])],
    }));
  }

  return [await markdownToMemory(candidate, backupRoot)];
}

export async function ensureBackupRoot(backupRoot: string): Promise<void> {
  const rootStat = await stat(backupRoot).catch(() => null);
  if (!rootStat?.isDirectory()) {
    throw new Error(`Folder backup tidak ditemukan: ${backupRoot}`);
  }
}

/** Hanya path yang relevan untuk auto-sync (bukan snapshot arsip cursor-chats). */
export function isSyncWatchPath(filePath: string, backupRoot: string): boolean {
  const rel = relative(resolve(backupRoot), resolve(filePath)).replace(/\\/g, '/');

  if (rel === 'cursor-chats/CONTEXT-HANDOFF.md') return true;
  if (rel.startsWith('cursor-chats/latest/')) return true;

  if (rel.startsWith('cursor-chats/')) return false;

  if (/^chat-[^/]+/.test(rel)) return true;
  if (/^landing-[^/]+/.test(rel)) return true;
  if (/^cursor-chat[^/]*/.test(rel)) return true;
  if (/^clearance-[^/]+/.test(rel)) return true;
  if (/^chat-session-/.test(rel)) return true;
  if (/^chat-turnstile/.test(rel)) return true;
  if (/^prompt-/.test(rel)) return true;
  if (/^cursor_cursor_/.test(rel)) return true;
  if (!rel.includes('/') && /\.(md|markdown)$/i.test(rel)) return true;

  return false;
}

export async function collectSyncCandidates(backupRoot: string): Promise<BackupCandidate[]> {
  const all = await collectCandidates(backupRoot, backupRoot, true);
  return all.filter((c) => isSyncWatchPath(c.filePath, backupRoot));
}
