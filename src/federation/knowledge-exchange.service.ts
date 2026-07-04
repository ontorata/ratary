import type { MemoryService } from '../services/memory.service.js';
import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import { ForbiddenError, NotFoundError } from '../types/errors.js';
import type { MemoryScope } from '../types/memory-scope.js';
import { nowISO } from '../utils/memory-mapper.js';
import type { IKnowledgeExchangeService } from './ports/iknowledge-exchange.port.js';
import type { IFederationRegistry } from './ports/ifederation-registry.port.js';
import type { IFederationTransport } from './ports/ifederation-transport.port.js';
import type { IFederationTrustStore } from './ports/ifederation-trust-store.port.js';
import type { IFederationPolicy } from './ports/ifederation-policy.port.js';
import type { IFederationScopeMapper } from './ports/ifederation-scope-mapper.port.js';
import type { IFederationConflictResolver } from './ports/ifederation-conflict-resolver.port.js';
import type { IFederationMetadataStore } from './ports/ifederation-metadata-store.port.js';
import type {
  FederationExchangeResult,
  FederationPullRequest,
  FederationStatusResult,
} from './types/federation-exchange.types.js';
import type { FederationNodeDescriptor } from './types/federation-node.descriptor.js';
import type { FederatedMemoryRecord } from './types/federated-memory.bundle.js';

export class KnowledgeExchangeService implements IKnowledgeExchangeService {
  constructor(
    private readonly registry: IFederationRegistry,
    private readonly transport: IFederationTransport,
    private readonly trustStore: IFederationTrustStore,
    private readonly policy: IFederationPolicy,
    private readonly scopeMapper: IFederationScopeMapper,
    private readonly conflictResolver: IFederationConflictResolver,
    private readonly metadataStore: IFederationMetadataStore,
    private readonly memoryService: MemoryService | null,
    private readonly memoryRepository: IMemoryRepository,
  ) {}

  async pullAndApply(
    peerId: string,
    request: FederationPullRequest,
    localScope: MemoryScope,
  ): Promise<FederationExchangeResult> {
    const peer = await this.requirePeer(peerId);
    this.assertMemoryService();

    if (!(await this.trustStore.verifyPeer(peerId))) {
      throw new ForbiddenError('Federation peer trust verification failed');
    }
    if (!(await this.policy.canImport(peer, localScope))) {
      throw new ForbiddenError('Federation import denied by policy');
    }

    const bundle = await this.transport.pull(request);
    if (!(await this.trustStore.verifyBundle(bundle))) {
      throw new ForbiddenError('Federation bundle signature invalid');
    }

    const applyScope = await this.scopeMapper.toLocalScope(bundle.target, {
      peerId,
      trusted: Boolean(peer.trusted),
    });

    let accepted = 0;
    let rejected = 0;

    for (const record of bundle.memories) {
      const outcome = await this.applyInboundRecord(applyScope, record);
      if (outcome) accepted += 1;
      else rejected += 1;
    }

    const cursor = bundle.memories.at(-1)?.updatedAt ?? request.cursor ?? null;
    if (cursor) {
      await this.metadataStore.setSyncCursor(peerId, localScope, cursor);
    }

    const result: FederationExchangeResult = {
      peerId,
      direction: 'pull',
      accepted,
      rejected,
      bundleId: bundle.bundleId,
      cursor,
      timestamp: nowISO(),
    };
    await this.metadataStore.recordExchange(result);
    return result;
  }

  async pushToPeer(
    peerId: string,
    memoryIds: string[],
    localScope: MemoryScope,
  ): Promise<FederationExchangeResult> {
    const peer = await this.requirePeer(peerId);
    const local = await this.registry.getLocal();
    if (!local) throw new NotFoundError('Local federation node not registered');

    const exportable = await this.policy.filterExportable(memoryIds, localScope);
    const sourceRef = await this.scopeMapper.toRemoteScope(localScope, local);
    const targetRef = await this.scopeMapper.toRemoteScope(localScope, peer);

    if (!(await this.policy.canExport(sourceRef, peer))) {
      throw new ForbiddenError('Federation export denied by policy');
    }

    const bundle = await this.transport.pull({
      source: { ...sourceRef, nodeId: local.nodeId },
      target: targetRef,
      memoryIds: exportable,
    });

    const signed = await this.trustStore.signBundle(bundle);
    const pushResult = await this.transport.push(signed);

    const result: FederationExchangeResult = {
      peerId,
      direction: 'push',
      accepted: pushResult.accepted,
      rejected: pushResult.rejected,
      bundleId: signed.bundleId,
      timestamp: nowISO(),
    };
    await this.metadataStore.recordExchange(result);
    return result;
  }

  async listPeers(localScope: MemoryScope): Promise<FederationNodeDescriptor[]> {
    const peers = await this.registry.listPeers();
    const visible: FederationNodeDescriptor[] = [];
    for (const peer of peers) {
      if (await this.policy.canImport(peer, localScope)) {
        visible.push(peer);
      }
    }
    return visible;
  }

  async getStatus(localScope: MemoryScope): Promise<FederationStatusResult> {
    const local = await this.registry.getLocal();
    const peers = await this.listPeers(localScope);
    const lastExchangeAt = local
      ? await this.metadataStore.getLastExchangeAt(local.nodeId)
      : undefined;

    return {
      enabled: true,
      nodeId: local?.nodeId ?? '',
      peerCount: peers.length,
      peers: peers.map((p) => ({
        nodeId: p.nodeId,
        displayName: p.displayName,
        region: p.region,
        trusted: p.trusted,
      })),
      lastExchangeAt: lastExchangeAt ?? undefined,
    };
  }

  private async applyInboundRecord(
    scope: MemoryScope,
    record: FederatedMemoryRecord,
  ): Promise<boolean> {
    const memoryService = this.assertMemoryService();
    const existing = record.codename
      ? await this.memoryRepository
          .findByCodename(scope.ownerId, record.codename, scope.workspaceId)
          .catch(() => null)
      : null;

    const localRecord: FederatedMemoryRecord | null = existing
      ? {
          sourceMemoryId: existing.id,
          codename: existing.codename ?? undefined,
          updatedAt: existing.updatedAt,
          metadata: {},
        }
      : null;

    const decision = await this.conflictResolver.resolve(localRecord, record);
    if (decision === 'reject') return false;

    const meta = record.metadata as {
      project?: string;
      tags?: string[];
      favorite?: boolean;
    };

    if (!existing || decision === 'accept') {
      await memoryService.createMemory(scope, {
        title: record.title ?? record.summary ?? 'Federated memory',
        content: record.body ?? record.summary ?? '',
        project: meta.project ?? '',
        summary: record.summary ?? '',
        tags: meta.tags ?? [],
        favorite: meta.favorite ?? false,
        level: 'note',
      });
      return true;
    }

    await memoryService.updateMemory(scope, existing.id, {
      title: record.title ?? existing.title,
      content: record.body ?? existing.content,
      summary: record.summary ?? existing.summary,
      tags: meta.tags ?? existing.tags,
      favorite: meta.favorite ?? existing.favorite,
      expectedUpdatedAt: existing.updatedAt,
    });
    return true;
  }

  private async requirePeer(peerId: string): Promise<FederationNodeDescriptor> {
    const peer = await this.registry.getPeer(peerId);
    if (!peer) throw new NotFoundError(`Federation peer not found: ${peerId}`);
    return peer;
  }

  private assertMemoryService(): MemoryService {
    if (!this.memoryService) {
      throw new Error('MemoryService is not bound to KnowledgeExchangeService');
    }
    return this.memoryService;
  }
}
