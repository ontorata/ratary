/**
 * Phase 35 — symbol extraction from structured memory fields (ADR-068 E6).
 *
 * Pure function. Only structured fields participate in v1: codename, tags,
 * keywords. Title/content scanning is explicitly deferred (owner decision).
 * Output order is deterministic: codename first, then tags, then keywords,
 * each in stored order, de-duplicated by (field, normalized symbol).
 */
import type { Memory } from '../../types/memory.js';
import type { SymbolInput } from '../../ports/entities/ientity-resolver.port.js';
import { normalizeSymbol } from './normalize.js';

export function extractSymbols(
  memory: Pick<Memory, 'codename' | 'tags' | 'keywords'>,
): SymbolInput[] {
  const symbols: SymbolInput[] = [];
  const seen = new Set<string>();

  const push = (symbol: string, field: SymbolInput['field']): void => {
    const normalized = normalizeSymbol(symbol);
    if (normalized.length === 0) {
      return;
    }
    const key = `${field}:${normalized}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    symbols.push({ symbol, field });
  };

  if (memory.codename) {
    push(memory.codename, 'codename');
  }
  for (const tag of memory.tags) {
    push(tag, 'tag');
  }
  for (const keyword of memory.keywords) {
    push(keyword, 'keyword');
  }

  return symbols;
}
