import type { MemoryType } from '../types/knowledge.js';

const MEMORY_TYPE_PREFIX: Record<MemoryType, string> = {
  note: 'NOTE',
  prompt: 'PROMPT',
  code: 'CODE',
  architecture: 'ARCH',
  task: 'TASK',
  meeting: 'MEET',
  research: 'RES',
  documentation: 'DOC',
  api: 'API',
  config: 'CFG',
};

export function formatCodename(prefix: string, sequence: number): string {
  const normalized =
    prefix
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 12) || 'MEM';
  const pad = sequence > 9999 ? 5 : 4;
  return `${normalized}-${String(sequence).padStart(pad, '0')}`;
}

export function resolveCodenamePrefix(input: {
  memoryType?: MemoryType;
  category?: string;
  project?: string;
}): string {
  if (input.memoryType) {
    return MEMORY_TYPE_PREFIX[input.memoryType];
  }
  if (input.category && input.category.length > 0) {
    return input.category
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 12);
  }
  if (input.project && input.project.length > 0) {
    return input.project
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 12);
  }
  return 'MEM';
}

export function parseCodenameSequence(codename: string, prefix: string): number {
  const upper = codename.toUpperCase();
  const normalizedPrefix = prefix.toUpperCase();
  if (!upper.startsWith(`${normalizedPrefix}-`)) return 0;
  const seqPart = upper.slice(normalizedPrefix.length + 1);
  const parsed = parseInt(seqPart, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
