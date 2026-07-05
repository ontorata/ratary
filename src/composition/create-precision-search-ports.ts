import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { getEnv } from '../config/env.js';
import { D1EmbeddingStore } from '../embedding/d1-embedding.store.js';
import { createEmbeddingProvider } from '../embedding/create-embedding-provider.js';
import type { IMemoryReader } from '../repositories/memory.repository.interface.js';
import { MemoryRelationRepository } from '../repositories/memory-relation.repository.js';
import { NoopReranker } from '../search/rerank/noop-reranker.js';
import {
  LexicalCrossEncoderReranker,
  OnnxCrossEncoderReranker,
} from '../search/rerank/onnx-cross-encoder-reranker.js';
import type { IReranker } from '../search/rerank/ireranker.port.js';
import type { IPrecisionSearchService } from '../search/precision/iprecision-search-service.interface.js';
import { PrecisionSearchOrchestrator } from '../search/precision/precision-search-orchestrator.js';

function createReranker(): IReranker {
  const env = getEnv();
  if (!env.SEARCH_RERANK_ENABLED) {
    return new NoopReranker();
  }
  if (env.RERANK_MODEL_PATH) {
    return new OnnxCrossEncoderReranker(env.RERANK_MODEL_PATH);
  }
  return new LexicalCrossEncoderReranker();
}

export function createPrecisionSearchService(
  db: ISqlDatabase,
  reader: IMemoryReader,
): IPrecisionSearchService | undefined {
  const env = getEnv();
  if (!env.PRECISION_SEARCH_ENABLED) {
    return undefined;
  }

  const embeddingStore = new D1EmbeddingStore(db);
  const embeddingProvider = createEmbeddingProvider();
  const relations = new MemoryRelationRepository(db);

  return new PrecisionSearchOrchestrator(
    reader,
    relations,
    embeddingStore,
    embeddingProvider,
    createReranker(),
    env,
  );
}
