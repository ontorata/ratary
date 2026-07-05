/**
 * Phase 6.6A — exclude memories by source_path glob patterns (env SEARCH_IGNORE_PATTERNS).
 */

export function parseIgnorePatterns(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\.\//, '');
}

/** Convert simple glob (** and *) to RegExp for path matching. */
export function globToRegExp(pattern: string): RegExp {
  const normalized = normalizePath(pattern);
  let regex = '^';
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (ch === '*' && normalized[i + 1] === '*') {
      regex += '.*';
      i++;
      if (normalized[i + 1] === '/') i++;
    } else if (ch === '*') {
      regex += '[^/]*';
    } else if (ch === '?') {
      regex += '.';
    } else if (/[$^+.|(){}[\]\\]/.test(ch)) {
      regex += `\\${ch}`;
    } else {
      regex += ch;
    }
  }
  regex += '$';
  return new RegExp(regex, 'i');
}

export function sourcePathMatchesIgnore(
  sourcePath: string | null | undefined,
  patterns: readonly string[],
): boolean {
  if (!patterns.length || sourcePath == null || sourcePath === '') {
    return false;
  }
  const normalized = normalizePath(sourcePath);
  return patterns.some((pattern) => globToRegExp(pattern).test(normalized));
}

/** SQL: exclude rows whose source_path matches any ignore pattern (best-effort LIKE). */
export function applyIgnorePatternsToSql(patterns: readonly string[]): SqlIgnoreFragment {
  const conditions: string[] = [];
  const params: unknown[] = [];

  for (const pattern of patterns) {
    const normalized = normalizePath(pattern);
    if (normalized.includes('**')) {
      const segment = normalized.replace(/^\*\*\//, '').replace(/\/\*\*$/, '').replace(/\*\*/g, '');
      if (segment) {
        conditions.push('(source_path IS NULL OR source_path NOT LIKE ?)');
        params.push(`%${segment}%`);
      }
    } else if (normalized.endsWith('*')) {
      const prefix = normalized.slice(0, -1).replace(/\/+$/, '');
      conditions.push('(source_path IS NULL OR source_path NOT LIKE ?)');
      params.push(`${prefix}%`);
    } else if (normalized.startsWith('*')) {
      conditions.push('(source_path IS NULL OR source_path NOT LIKE ?)');
      params.push(`%${normalized.slice(1)}`);
    } else {
      conditions.push('(source_path IS NULL OR source_path NOT LIKE ?)');
      params.push(`${normalized}%`);
    }
  }

  return { conditions, params };
}

export interface SqlIgnoreFragment {
  conditions: string[];
  params: unknown[];
}
