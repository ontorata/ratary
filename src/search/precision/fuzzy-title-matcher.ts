import type { Memory } from '../../types/memory.js';

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

export function fuzzyTitleScore(title: string, query: string, fuzzyBoost: number): number {
  const normalizedTitle = title.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return 0;
  if (normalizedTitle === normalizedQuery) return 100;
  if (normalizedTitle.includes(normalizedQuery)) return 70;

  const distance = levenshtein(normalizedTitle, normalizedQuery);
  const maxLen = Math.max(normalizedTitle.length, normalizedQuery.length);
  if (maxLen === 0) return 0;
  const similarity = 1 - distance / maxLen;
  if (similarity < 0.6) return 0;
  return Math.round(50 * similarity * fuzzyBoost);
}

export function rankTitleMode(
  memories: Memory[],
  query: string,
  fuzzyBoost: number,
  aliasBoost: number,
): Array<Memory & { relevanceScore: number }> {
  const q = query.trim();
  return memories
    .map((memory) => {
      let score = fuzzyTitleScore(memory.title, q, fuzzyBoost);
      for (const alias of memory.aliases) {
        if (alias.toLowerCase() === q.toLowerCase()) {
          score = Math.max(score, aliasBoost);
        } else if (alias.toLowerCase().includes(q.toLowerCase())) {
          score = Math.max(score, Math.round(aliasBoost * 0.7));
        }
      }
      return { ...memory, relevanceScore: score };
    })
    .filter((memory) => memory.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

export function suggestSimilarPaths(
  target: string,
  candidates: readonly string[],
  limit = 3,
): string[] {
  const normalizedTarget = target.replace(/\\/g, '/').toLowerCase();
  return [...candidates]
    .map((path) => ({
      path,
      distance: levenshtein(path.replace(/\\/g, '/').toLowerCase(), normalizedTarget),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((entry) => entry.path);
}
