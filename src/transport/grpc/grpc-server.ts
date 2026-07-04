import { readFileSync } from 'node:fs';
import { Server, ServerCredentials, type UntypedServiceImplementation } from '@grpc/grpc-js';
import { getD1Client } from '../../db/index.js';
import { getEnv } from '../../config/index.js';
import { MemoryRepository } from '../../repositories/memory.repository.js';
import { MemoryRelationRepository } from '../../repositories/memory-relation.repository.js';
import {
  createMemoryService,
  createMemoryRelationService,
} from '../../services/create-memory-service.js';
import { createContextService } from '../../memory/create-context-service.js';
import { createMemoryAccessAuditor } from '../../infrastructure/composition/create-memory-access-auditor.js';
import { createEmbeddingProvider } from '../../embedding/create-embedding-provider.js';
import { createPlatformAdapters } from '../../infrastructure/composition/create-platform-adapters.js';
import { createMemoryEvolutionPorts } from '../../composition/create-memory-evolution-ports.js';
import { createGraphService } from '../../services/graph.service.js';
import { createMultiAiPorts } from '../../composition/create-multi-ai-ports.js';
import { createTransportHandlers } from '../shared/handlers/create-transport-handlers.js';
import type { ITransportServer, TransportHealth } from '../registry/itransport-server.interface.js';
import { loadAiBrainProto } from './load-proto.js';
import { createGrpcServiceImplementations } from './grpc-services.js';

/**
 * gRPC transport server (ADR-027 Phase 10.5E) — default OFF via GRPC_ENABLED.
 * Composes the same application services as REST/MCP and binds proto v1
 * services to shared handlers. No business logic lives here.
 */
export class GrpcTransportServer implements ITransportServer {
  readonly protocol = 'grpc' as const;
  private server: Server | null = null;
  private serving = false;
  private boundPort = 0;

  async start(): Promise<void> {
    if (this.serving) return;
    const env = getEnv();

    const d1 = env.SQL_PROVIDER === 'd1' ? getD1Client() : null;
    const platform = createPlatformAdapters(d1, env);
    const repository = new MemoryRepository(platform.sql);
    const relationRepository = new MemoryRelationRepository(platform.sql);
    const multiAi = createMultiAiPorts(platform.sql);
    const evolutionPorts = createMemoryEvolutionPorts(platform.sql, env);
    const memoryService = createMemoryService(
      platform.sql,
      repository,
      multiAi,
      evolutionPorts.coordinator,
    );
    const relationService = createMemoryRelationService(
      platform.sql,
      repository,
      relationRepository,
    );
    const embeddingProvider = createEmbeddingProvider();
    const memoryAccessAuditor = createMemoryAccessAuditor(env, platform.sql);
    const contextService = createContextService(repository, {
      embeddingProvider,
      vectorStore: platform.vectorStore,
      sql: platform.sql,
      memoryAccessAuditor,
    });
    const graphService = createGraphService(platform.sql, repository);

    const handlers = createTransportHandlers({
      memoryService,
      contextService,
      graphService,
      relationService,
      scopeResolver: multiAi.scopeResolver,
      env,
    });

    const proto = loadAiBrainProto();
    const impls = createGrpcServiceImplementations(handlers);

    const server = new Server();
    server.addService(proto.MemoryService.service, impls.memory);
    server.addService(proto.SearchService.service, impls.search);
    server.addService(proto.ContextService.service, impls.context as UntypedServiceImplementation);
    server.addService(proto.HealthService.service, impls.health);

    const credentials = this.resolveCredentials(env.GRPC_TLS_CERT_PATH, env.GRPC_TLS_KEY_PATH);

    await new Promise<void>((resolvePromise, reject) => {
      server.bindAsync(`${env.GRPC_HOST}:${env.GRPC_PORT}`, credentials, (error, port) => {
        if (error) {
          reject(error);
          return;
        }
        this.boundPort = port;
        resolvePromise();
      });
    });

    this.server = server;
    this.serving = true;
  }

  async stop(): Promise<void> {
    const server = this.server;
    if (!server) {
      this.serving = false;
      return;
    }
    await new Promise<void>((resolvePromise) => {
      server.tryShutdown(() => resolvePromise());
    });
    this.server = null;
    this.serving = false;
  }

  health(): TransportHealth {
    return {
      status: this.serving ? 'ok' : 'down',
      details: { protoVersion: 'v1', port: this.boundPort },
    };
  }

  private resolveCredentials(certPath?: string, keyPath?: string): ServerCredentials {
    if (certPath && keyPath) {
      const cert = readFileSync(certPath);
      const key = readFileSync(keyPath);
      return ServerCredentials.createSsl(null, [{ private_key: key, cert_chain: cert }], false);
    }
    return ServerCredentials.createInsecure();
  }
}
