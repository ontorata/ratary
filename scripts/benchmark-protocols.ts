#!/usr/bin/env tsx
/**
 * Protocol benchmark CLI (Phase 13E) — in-process handler timings.
 * Usage: npm run benchmark:protocols
 */
import { setD1Client, resetD1Client } from '../src/db/index.js';
import { MockD1Client } from '../tests/helpers/mock-d1.js';
import {
  createTestMemoryRepository,
  createTestRelationRepository,
  asSqlDatabase,
} from '../tests/helpers/sql-test-harness.js';
import {
  createMemoryService,
  createMemoryRelationService,
} from '../src/services/create-memory-service.js';
import { createContextService } from '../src/memory/create-context-service.js';
import { createGraphService } from '../src/services/graph.service.js';
import { DefaultScopeResolver } from '../src/scope/default-scope-resolver.js';
import { getEnv, resetEnvCache } from '../src/config/index.js';
import { createTransportHandlers } from '../src/transport/shared/handlers/create-transport-handlers.js';
import { runProtocolBenchmark } from '../src/transport/benchmark/protocol-benchmark.runner.js';

process.env.CLOUDFLARE_ACCOUNT_ID ??= 'bench-account';
process.env.D1_DATABASE_ID ??= 'bench-database';
process.env.D1_API_TOKEN ??= 'bench-token';
process.env.NODE_ENV ??= 'test';
resetEnvCache();

async function main(): Promise<void> {
  resetD1Client();
  const mockDb = new MockD1Client();
  setD1Client(mockDb);
  const sql = asSqlDatabase(mockDb);
  const repository = createTestMemoryRepository(mockDb);
  const relationRepository = createTestRelationRepository(mockDb);
  const memoryService = createMemoryService(sql, repository);
  const relationService = createMemoryRelationService(sql, repository, relationRepository);
  const contextService = createContextService(repository, { sql });
  const graphService = createGraphService(sql, repository);
  const scopeResolver = new DefaultScopeResolver(sql);

  const handlers = createTransportHandlers({
    memoryService,
    contextService,
    graphService,
    relationService,
    scopeResolver,
    env: getEnv(),
  });

  const report = await runProtocolBenchmark(
    {
      handlers,
      ctx: {
        requestId: 'bench-1',
        ownerId: 'bench-owner',
        auth: null,
        source: 'rest',
      },
    },
    { fixture: 'context-search', iterations: Number(process.env.BENCHMARK_ITERATIONS ?? 5) },
  );

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
