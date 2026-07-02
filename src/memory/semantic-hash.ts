import { createHash } from 'node:crypto';

export function normalizeForHash(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function computeSemanticHash(title: string, summary: string, content: string): string {
  const payload = [normalizeForHash(title), normalizeForHash(summary), content.slice(0, 500)].join(
    '|',
  );

  return createHash('sha256').update(payload).digest('hex');
}

export function normalizeTitleForDedup(title: string): string {
  return normalizeForHash(title);
}
