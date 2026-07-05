import { z } from 'zod';
import type { ScoredMemory } from '../search/search.service.js';
import type { SearchFilterGrammar } from '../search/precision/search-filter-grammar.js';

export const PRECISION_SEARCH_MODES = ['hybrid', 'semantic', 'fulltext', 'title'] as const;
export type PrecisionSearchMode = (typeof PRECISION_SEARCH_MODES)[number];

export interface SimilarToRef {
  memoryId?: string;
  slug?: string;
  sourcePath?: string;
}

export interface PrecisionSearchRequest {
  queries: string[];
  mode?: PrecisionSearchMode;
  rerank?: boolean;
  snippetLength?: number;
  extended?: boolean;
  filters?: SearchFilterGrammar;
  similarTo?: SimilarToRef;
  limit?: number;
  offset?: number;
  tag?: string;
  project?: string;
  category?: string;
  memoryType?: string;
  importanceMin?: number;
  favorite?: boolean;
  archived?: boolean;
}

export interface PrecisionSearchLink {
  memoryId: string;
  relation: string;
  title?: string;
}

export interface PrecisionSearchHit extends ScoredMemory {
  snippet?: string;
  outgoingLinks?: PrecisionSearchLink[];
  backlinks?: PrecisionSearchLink[];
}

export interface PrecisionSearchResponse {
  hits: PrecisionSearchHit[];
  total: number;
  mode: PrecisionSearchMode;
  warnings?: string[];
}

export interface SimilarMemoryQuery {
  memoryId?: string;
  slug?: string;
  sourcePath?: string;
  limit?: number;
  offset?: number;
}

export interface ByPathQuery {
  path: string;
  suggest?: boolean;
}

export interface ByPathResult {
  memory?: PrecisionSearchHit;
  suggestions?: string[];
}

function parseStringList(val: unknown): string[] | undefined {
  if (val === undefined) return undefined;
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return undefined;
}

export const precisionSearchQueryExtensions = {
  mode: z.enum(PRECISION_SEARCH_MODES).optional(),
  queries: z.preprocess(parseStringList, z.array(z.string()).optional()),
  rerank: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  snippet_length: z.coerce.number().int().min(0).max(2000).optional(),
  extended: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  tag_mode: z.enum(['or', 'and']).optional(),
  projects: z.preprocess(parseStringList, z.array(z.string()).optional()),
  project_exclude: z.preprocess(parseStringList, z.array(z.string()).optional()),
  tags: z.preprocess(parseStringList, z.array(z.string()).optional()),
  tag_exclude: z.preprocess(parseStringList, z.array(z.string()).optional()),
  source_path_prefix: z.preprocess(parseStringList, z.array(z.string()).optional()),
  source_path_exclude: z.preprocess(parseStringList, z.array(z.string()).optional()),
};

export const similarMemoryQuerySchema = z
  .object({
    memoryId: z.string().uuid().optional(),
    slug: z.string().optional(),
    sourcePath: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .refine((data) => Boolean(data.memoryId ?? data.slug ?? data.sourcePath), {
    message: 'memoryId, slug, or sourcePath is required',
  });

export const byPathQuerySchema = z.object({
  path: z.string().min(1),
  suggest: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

export type SimilarMemoryQueryInput = z.infer<typeof similarMemoryQuerySchema>;
export type ByPathQueryInput = z.infer<typeof byPathQuerySchema>;

export function buildFilterGrammarFromQuery(query: {
  project?: string;
  projects?: string[];
  project_exclude?: string[];
  tag?: string;
  tags?: string[];
  tag_exclude?: string[];
  tag_mode?: 'or' | 'and';
  source_path_prefix?: string[];
  source_path_exclude?: string[];
}): SearchFilterGrammar | undefined {
  const grammar: SearchFilterGrammar = {};
  const projects = query.projects ?? (query.project ? [query.project] : undefined);
  if (projects?.length) grammar.projects = projects;
  if (query.project_exclude?.length) grammar.projectExclude = query.project_exclude;
  if (query.tags?.length) grammar.tags = query.tags;
  else if (query.tag) grammar.tags = [query.tag];
  if (query.tag_exclude?.length) grammar.tagExclude = query.tag_exclude;
  if (query.tag_mode) grammar.tagMode = query.tag_mode;
  if (query.source_path_prefix?.length) grammar.sourcePathPrefix = query.source_path_prefix;
  if (query.source_path_exclude?.length) grammar.sourcePathExclude = query.source_path_exclude;

  const hasAny =
    grammar.projects?.length ||
    grammar.projectExclude?.length ||
    grammar.tags?.length ||
    grammar.tagExclude?.length ||
    grammar.sourcePathPrefix?.length ||
    grammar.sourcePathExclude?.length;

  return hasAny ? grammar : undefined;
}

export function mapSearchQueryToPrecisionRequest(
  query: Record<string, unknown> & {
    q?: string;
    tag?: string;
    project?: string;
    category?: string;
    memory_type?: string;
    importance_min?: number;
    favorite?: boolean;
    archived?: boolean;
    limit?: number;
    offset?: number;
    mode?: PrecisionSearchMode;
    queries?: string[];
    rerank?: boolean;
    snippet_length?: number;
    extended?: boolean;
    tag_mode?: 'or' | 'and';
    projects?: string[];
    project_exclude?: string[];
    tags?: string[];
    tag_exclude?: string[];
    source_path_prefix?: string[];
    source_path_exclude?: string[];
  },
  defaultMode: PrecisionSearchMode,
): PrecisionSearchRequest {
  const queries =
    query.queries?.filter(Boolean) ??
    (query.q?.trim() ? [query.q.trim()] : query.tag ? [query.tag] : ['']);

  return {
    queries: queries.length ? queries : [''],
    mode: query.mode ?? defaultMode,
    rerank: query.rerank,
    snippetLength: query.snippet_length,
    extended: query.extended,
    filters: buildFilterGrammarFromQuery(query),
    limit: query.limit,
    offset: query.offset,
    tag: query.tag,
    project: query.project,
    category: query.category,
    memoryType: query.memory_type,
    importanceMin: query.importance_min,
    favorite: query.favorite,
    archived: query.archived,
  };
}
