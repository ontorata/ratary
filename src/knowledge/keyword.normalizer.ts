export function normalizeKeywords(tags: string[], explicitKeywords?: string[]): string[] {
  const merged = [...(explicitKeywords ?? []), ...tags];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of merged) {
    const keyword = raw.trim().toLowerCase();
    if (!keyword || seen.has(keyword)) continue;
    seen.add(keyword);
    result.push(keyword);
    if (result.length >= 30) break;
  }

  return result;
}
