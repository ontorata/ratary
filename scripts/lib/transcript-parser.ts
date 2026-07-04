import { readFile } from 'node:fs/promises';
import { basename, dirname } from 'node:path';
import { generateSummary } from '../../src/knowledge/summary.generator.js';

const MAX_CONTENT_CHARS = 60_000;
const MAX_ASSISTANT_CHARS_PER_TURN = 4_000;
const MAX_USER_CHARS_PER_TURN = 2_000;

interface ContentBlock {
  type: string;
  text?: string;
}

interface TranscriptLine {
  role: 'user' | 'assistant';
  message?: {
    content?: ContentBlock[];
  };
}

export interface DialogueTurn {
  user: string;
  assistant: string;
}

export interface TranscriptMemory {
  title: string;
  project: string;
  content: string;
  summary: string;
  tags: string[];
  transcriptId: string;
  part?: number;
  totalParts?: number;
}

function extractTextBlocks(content: ContentBlock[] | undefined): string {
  if (!content?.length) return '';

  return content
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text!.trim())
    .filter(Boolean)
    .join('\n\n');
}

function cleanUserText(raw: string): string {
  return raw
    .replace(/<user_query>\s*/gi, '')
    .replace(/<\/user_query>\s*/gi, '')
    .replace(/^\[Image\]\s*/i, '')
    .trim();
}

function cleanAssistantText(raw: string): string {
  const parts = raw
    .split('\n\n')
    .map((p) => p.trim())
    .filter((p) => p && p !== '[REDACTED]');

  return parts.join('\n\n').trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n\n…(dipotong)`;
}

export function parseTranscriptJsonl(raw: string): DialogueTurn[] {
  const turns: DialogueTurn[] = [];
  let currentUser = '';
  let currentAssistant: string[] = [];

  const flush = (): void => {
    if (!currentUser && currentAssistant.length === 0) return;

    turns.push({
      user: truncate(cleanUserText(currentUser), MAX_USER_CHARS_PER_TURN),
      assistant: truncate(cleanAssistantText(currentAssistant.join('\n\n')), MAX_ASSISTANT_CHARS_PER_TURN),
    });

    currentUser = '';
    currentAssistant = [];
  };

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let parsed: TranscriptLine;
    try {
      parsed = JSON.parse(trimmed) as TranscriptLine;
    } catch {
      continue;
    }

    const text = extractTextBlocks(parsed.message?.content);
    if (!text) continue;

    if (parsed.role === 'user') {
      if (currentUser || currentAssistant.length > 0) flush();
      currentUser = text;
      continue;
    }

    if (parsed.role === 'assistant') {
      const cleaned = cleanAssistantText(text);
      if (cleaned) currentAssistant.push(cleaned);
    }
  }

  flush();
  return turns.filter((t) => t.user || t.assistant);
}

function titleFromFirstUser(turns: DialogueTurn[], transcriptId: string): string {
  const first = turns.find((t) => t.user.trim());
  if (!first) return `Transcript ${transcriptId.slice(0, 8)}`;

  let oneLine = first.user
    .split('\n')[0]!
    .replace(/@[^\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!oneLine || oneLine.length < 5) {
    oneLine = `Transcript ${transcriptId.slice(0, 8)}`;
  }

  if (oneLine.length <= 120) return oneLine;
  return `${oneLine.slice(0, 117)}…`;
}

function summaryFromTurns(turns: DialogueTurn[]): string {
  const firstUser = turns.find((t) => t.user)?.user ?? '';
  const lastAssistant = [...turns].reverse().find((t) => t.assistant)?.assistant ?? '';

  const candidate = firstUser || lastAssistant.split('\n')[0] || '';
  return generateSummary(candidate);
}

function detectProject(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('ai-brain') || lower.includes('ai memory cloud')) return 'ai-brain';
  if (lower.includes('geo-fastify')) return 'geo-fastify';
  if (lower.includes('mangroveapps') || lower.includes('mangrove') || lower.includes('sipem')) return 'MangroveApps';
  if (lower.includes('sippem')) return 'sippem';
  if (lower.includes('geoportal')) return 'geoportal';
  return 'general';
}

function formatTurn(turn: DialogueTurn, index: number): string {
  const sections: string[] = [`### Giliran ${index + 1}`];

  if (turn.user) {
    sections.push('**User:**', turn.user);
  }
  if (turn.assistant) {
    sections.push('**Assistant:**', turn.assistant);
  }

  return sections.join('\n\n');
}

function chunkTurns(turns: DialogueTurn[], header: string): string[] {
  const chunks: string[] = [];
  let current = header;
  let partTurns: string[] = [];

  for (let i = 0; i < turns.length; i++) {
    const block = formatTurn(turns[i]!, i);
    const next = partTurns.length === 0 ? `${current}\n\n${block}` : `${current}\n\n${partTurns.join('\n\n---\n\n')}\n\n---\n\n${block}`;

    if (next.length > MAX_CONTENT_CHARS && partTurns.length > 0) {
      chunks.push(`${current}\n\n${partTurns.join('\n\n---\n\n')}`);
      current = header;
      partTurns = [block];
    } else if (next.length > MAX_CONTENT_CHARS) {
      chunks.push(next.slice(0, MAX_CONTENT_CHARS));
      current = header;
      partTurns = [];
    } else {
      partTurns.push(block);
    }
  }

  if (partTurns.length > 0) {
    chunks.push(`${current}\n\n${partTurns.join('\n\n---\n\n')}`);
  }

  return chunks.length > 0 ? chunks : [header];
}

export function transcriptToMemories(
  filePath: string,
  turns: DialogueTurn[],
): TranscriptMemory[] {
  const fileName = basename(filePath, '.jsonl');
  const transcriptId = fileName;
  const relPath = filePath.replace(/\\/g, '/');
  const baseTitle = titleFromFirstUser(turns, transcriptId);
  const project = detectProject(turns.map((t) => `${t.user}\n${t.assistant}`).join('\n'));
  const summary = summaryFromTurns(turns);

  const header = `# ${baseTitle}

> **Tipe:** Agent transcript (JSONL)
> **Transcript ID:** \`${transcriptId}\`
> **Sumber:** \`${relPath}\`
> **Total giliran:** ${turns.length}

Dialog diekstrak dari transcript Cursor (user query + jawaban assistant, tanpa tool calls).`;

  const contentChunks = chunkTurns(turns, header);
  const totalParts = contentChunks.length;

  return contentChunks.map((content, index) => ({
    title: totalParts > 1 ? `${baseTitle} (bagian ${index + 1}/${totalParts})` : baseTitle,
    project,
    content,
    summary,
    tags: ['transcript', 'agent-transcript', transcriptId.slice(0, 8)],
    transcriptId,
    part: totalParts > 1 ? index + 1 : undefined,
    totalParts: totalParts > 1 ? totalParts : undefined,
  }));
}

export async function parseTranscriptFile(filePath: string): Promise<TranscriptMemory[]> {
  const raw = await readFile(filePath, 'utf-8');
  const turns = parseTranscriptJsonl(raw);

  if (turns.length === 0) {
    throw new Error(`Tidak ada dialog yang bisa diekstrak: ${filePath}`);
  }

  return transcriptToMemories(filePath, turns);
}

export function isMainTranscript(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  if (normalized.includes('/subagents/')) return false;

  const fileName = basename(filePath);
  const folderName = basename(dirname(filePath));
  if (!fileName.endsWith('.jsonl')) return false;

  return fileName.replace('.jsonl', '') === folderName;
}
