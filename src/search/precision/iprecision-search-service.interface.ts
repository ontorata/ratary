import type { MemoryScope } from '../../types/memory-scope.js';
import type {
  ByPathQuery,
  ByPathResult,
  PrecisionSearchRequest,
  PrecisionSearchResponse,
  SimilarMemoryQuery,
} from '../../types/precision-search.js';

export interface IPrecisionSearchService {
  search(scope: MemoryScope, request: PrecisionSearchRequest): Promise<PrecisionSearchResponse>;
  findSimilar(scope: MemoryScope, query: SimilarMemoryQuery): Promise<PrecisionSearchResponse>;
  getByPath(scope: MemoryScope, query: ByPathQuery): Promise<ByPathResult>;
}
