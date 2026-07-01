const MAX_SLUG_LENGTH = 80;

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH);

  return base || 'memory';
}

export function withSlugSuffix(slug: string, suffix: number): string {
  const suffixStr = `-${suffix}`;
  const maxBase = MAX_SLUG_LENGTH - suffixStr.length;
  const trimmed = slug.slice(0, Math.max(1, maxBase)).replace(/-+$/, '');
  return `${trimmed}${suffixStr}`;
}
