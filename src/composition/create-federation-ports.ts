import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import type { MemoryService } from '../services/memory.service.js';
import { StaticFederationRegistry } from '../federation/adapters/static-federation-registry.adapter.js';
import { InProcessFederationTransport } from '../federation/adapters/in-process-federation-transport.adapter.js';
import { NoOpFederationTrustStore } from '../federation/adapters/noop-federation-trust-store.adapter.js';
import { RuleBasedFederationPolicy } from '../federation/adapters/rule-based-federation-policy.adapter.js';
import { DefaultFederationScopeMapper } from '../federation/adapters/default-federation-scope-mapper.adapter.js';
import { LastWriteWinsFederationConflictResolver } from '../federation/adapters/last-write-wins-conflict-resolver.adapter.js';
import { NoOpFederationMetadataStore } from '../federation/adapters/noop-federation-metadata-store.adapter.js';
import {
  KnowledgeExchangeService,
  NoOpKnowledgeExchangeService,
} from '../federation/index.js';
import type { IKnowledgeExchangeService } from '../federation/ports/iknowledge-exchange.port.js';
import type { FederationNodeDescriptor } from '../federation/types/federation-node.descriptor.js';
import { SqlFederationMetadataStore } from '../infrastructure/federation/sql-federation-metadata-store.js';
import { PROTOCOL_VERSION } from '../capabilities/capability-manifest.constants.js';

export interface FederationPorts {
  enabled: boolean;
  nodeId: string;
  createService(memoryService: MemoryService | null): IKnowledgeExchangeService;
}

function parsePeerList(raw: string | undefined): FederationNodeDescriptor[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as FederationNodeDescriptor[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Composition root for Phase 14 federation (ADR-029).
 * Gated by FEDERATION_ENABLED; SQL metadata when FEDERATION_METADATA_PROVIDER=sql.
 */
export function createFederationPorts(sql: ISqlDatabase, env: Env): FederationPorts {
  const noopFactory = () => new NoOpKnowledgeExchangeService();

  if (!env.FEDERATION_ENABLED) {
    return {
      enabled: false,
      nodeId: env.FEDERATION_NODE_ID,
      createService: noopFactory,
    };
  }

  const nodeId = env.FEDERATION_NODE_ID;
  const localNode: FederationNodeDescriptor = {
    nodeId,
    displayName: env.FEDERATION_NODE_DISPLAY_NAME,
    region: env.FEDERATION_NODE_REGION,
    cloud: env.FEDERATION_NODE_CLOUD,
    baseUrl: env.FEDERATION_NODE_BASE_URL,
    protocolVersion: PROTOCOL_VERSION,
  };

  const peers = parsePeerList(env.FEDERATION_PEERS_JSON);
  const registry = new StaticFederationRegistry(peers);
  void registry.registerLocal(localNode);

  const metadataStore =
    env.FEDERATION_METADATA_PROVIDER === 'sql'
      ? new SqlFederationMetadataStore(sql)
      : new NoOpFederationMetadataStore();

  const memoryRepository = new MemoryRepository(sql);
  const transport =
    env.FEDERATION_TRANSPORT_PROVIDER === 'in-process'
      ? new InProcessFederationTransport(registry, memoryRepository)
      : new InProcessFederationTransport(registry, memoryRepository);

  const trustStore = new NoOpFederationTrustStore();
  const policy = new RuleBasedFederationPolicy(registry, metadataStore);
  const scopeMapper = new DefaultFederationScopeMapper(nodeId);
  const conflictResolver = new LastWriteWinsFederationConflictResolver();

  return {
    enabled: true,
    nodeId,
    createService: (memoryService: MemoryService | null) =>
      new KnowledgeExchangeService(
        registry,
        transport,
        trustStore,
        policy,
        scopeMapper,
        conflictResolver,
        metadataStore,
        memoryService,
        memoryRepository,
      ),
  };
}
