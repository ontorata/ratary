import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { MemoryScope } from '../types/memory-scope.js';
import { workspaceIdFromScope } from '../repositories/repository-scope.js';
import { Retriever } from './retriever.js';
import { SqlRetrievalCandidateSource } from './sql-retrieval-candidate-source.js';
import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';
import { Ranker, type ScoredMemory } from './ranker.js';
import { ContextBuilder, type ContextBuildOptions } from './context-builder.js';
import { PromptBuilder } from './prompt-builder.js';
import {
  DEFAULT_RETRIEVAL_RANK_LIMIT,
  MAX_CONTEXT_MAX_CHARS,
  DEFAULT_RETRIEVAL_MEMO_MAX_ENTRIES,
  DEFAULT_RETRIEVAL_MEMO_TTL_MS,
} from './context.config.js';
import {
  RetrievalMemoCache,
  buildRetrievalMemoKey,
  type RetrievalMemoStatus,
} from './retrieval-memo-cache.js';
import type { IMemoryAccessAuditor } from '../ports/audit/imemory-access-auditor.port.js';
import type { MemoryLevel } from '../types/memory-level.js';
import type {
  IRetrievalPolicy,
  RetrievalPlan,
} from './retrieval-policy/iretrieval-policy.interface.js';
import { DefaultRetrievalPolicy } from './retrieval-policy/default-retrieval-policy.js';
import { buildAdaptiveRetrievalHints } from './retrieval-policy/retrieval-policy-hints.js';
import { expandWithRelationNeighbors } from './retrieval-policy/relation-context-expander.js';
import type { RetrievalDeploymentCapabilities } from './retrieval-policy/retrieval-budget.js';
import type { IMemoryRelationRepository } from '../repositories/memory-relation.repository.interface.js';
import type { RankingPolicySnapshot } from '../learning/learning.types.js';
import {
  createContextPackageEnvelope,
  canTransitionContextPackageLifecycle,
  type ContextPackageEnvelope,
  type ContextPackageLifecycleState,
} from './context-package-envelope.js';
import type {
  ContextPackageLifecycleRecord,
  IContextPackageLifecycleStore,
} from '../ports/context/icontext-package-lifecycle-store.port.js';
import { ConflictError, NotFoundError } from '../types/errors.js';

export interface BuildContextRequest {
  projectId?: string;
  query?: string;
  tags?: string[];
  levels?: MemoryLevel[];
  limit?: number;
  context?: ContextBuildOptions;
  auditIdentityId?: string;
  auditIpAddress?: string;
}

export interface BuildContextResult extends ContextPackageEnvelope {
  context: string;
  memories: ScoredMemory[];
  totalCandidates: number;
  retrievalPlan?: RetrievalPlan;
  /** ADR-1018 — ranked-candidate memo status (envelope always reminted). */
  retrievalMemo?: RetrievalMemoStatus;
}

export interface BuildPromptResult extends BuildContextResult {
  system: string;
  user: string;
}

export interface ContextServiceDeps {
  retrievalPolicy?: IRetrievalPolicy;
  deployment?: RetrievalDeploymentCapabilities;
  rankingSnapshotLoader?: (scope: MemoryScope) => Promise<RankingPolicySnapshot | null>;
  relationRepository?: IMemoryRelationRepository;
  relationNeighborCap?: number;
  lifecycleStore?: IContextPackageLifecycleStore;
  /** Process-local ranked memo; pass `null` to disable. */
  retrievalMemoCache?: RetrievalMemoCache | null;
}

export class ContextService {
  private readonly retriever: Retriever;
  private readonly ranker: Ranker;
  private readonly contextBuilder: ContextBuilder;
  private readonly promptBuilder: PromptBuilder;
  private readonly retrievalPolicy: IRetrievalPolicy;
  private readonly deployment: RetrievalDeploymentCapabilities;
  private readonly rankingSnapshotLoader?: (
    scope: MemoryScope,
  ) => Promise<RankingPolicySnapshot | null>;
  private readonly relationRepository?: IMemoryRelationRepository;
  private readonly relationNeighborCap: number;
  private readonly lifecycleStore?: IContextPackageLifecycleStore;
  private readonly retrievalMemoCache: RetrievalMemoCache | null;

  constructor(
    private readonly repository: IMemoryRepository,
    candidateSource?: IRetrievalCandidateSource,
    private readonly memoryAccessAuditor?: IMemoryAccessAuditor,
    deps: ContextServiceDeps = {},
  ) {
    this.retriever = new Retriever(candidateSource ?? new SqlRetrievalCandidateSource(repository));
    this.ranker = new Ranker();
    this.contextBuilder = new ContextBuilder();
    this.promptBuilder = new PromptBuilder();
    this.retrievalPolicy = deps.retrievalPolicy ?? new DefaultRetrievalPolicy();
    this.deployment = deps.deployment ?? {
      hybridRetrieval: false,
      graphRetrieval: false,
      maxContextMaxChars: MAX_CONTEXT_MAX_CHARS,
    };
    this.rankingSnapshotLoader = deps.rankingSnapshotLoader;
    this.relationRepository = deps.relationRepository;
    this.relationNeighborCap = deps.relationNeighborCap ?? 5;
    this.lifecycleStore = deps.lifecycleStore;
    this.retrievalMemoCache =
      deps.retrievalMemoCache === null
        ? null
        : (deps.retrievalMemoCache ??
          new RetrievalMemoCache(
            DEFAULT_RETRIEVAL_MEMO_TTL_MS,
            DEFAULT_RETRIEVAL_MEMO_MAX_ENTRIES,
          ));
  }

  async buildContext(
    scope: MemoryScope,
    request: BuildContextRequest,
  ): Promise<BuildContextResult> {
    const rankingSnapshot = this.rankingSnapshotLoader
      ? await this.rankingSnapshotLoader(scope)
      : undefined;

    const rankLimit = request.limit ?? DEFAULT_RETRIEVAL_RANK_LIMIT;
    const memoKey = buildRetrievalMemoKey({
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      projectId: request.projectId,
      query: request.query,
      tags: request.tags,
      levels: request.levels,
      limit: rankLimit,
      rankingSnapshotVersion: rankingSnapshot?.version ?? null,
    });

    let ranked: ScoredMemory[];
    let totalCandidates: number;
    let retrievalMemo: RetrievalMemoStatus = 'bypass';

    const memoHit = this.retrievalMemoCache?.get(memoKey) ?? null;
    if (memoHit) {
      ranked = [...memoHit.ranked];
      totalCandidates = memoHit.totalCandidates;
      retrievalMemo = 'hit';
    } else {
      const candidates = await this.retriever.retrieve({
        scope,
        projectId: request.projectId,
        query: request.query,
        tags: request.tags,
        levels: request.levels,
        limit: request.limit,
      });

      ranked = this.ranker.rank(
        candidates,
        { q: request.query, tag: request.tags?.[0] },
        rankLimit,
        rankingSnapshot ?? undefined,
      );
      totalCandidates = candidates.length;
      retrievalMemo = this.retrievalMemoCache ? 'miss' : 'bypass';
      this.retrievalMemoCache?.set(memoKey, ranked, totalCandidates);
    }

    const hints = buildAdaptiveRetrievalHints(ranked);
    const plan = this.retrievalPolicy.resolve(request, ranked.length, this.deployment, hints);

    let selected = ranked.slice(0, plan.budget.maxMemories);

    if (
      plan.budget.allowGraphExpansion &&
      plan.stagesApplied.includes('relations') &&
      this.relationRepository
    ) {
      selected = await expandWithRelationNeighbors(
        this.repository,
        this.relationRepository,
        scope,
        selected,
        this.relationNeighborCap,
      );
    }

    const contextOptions: ContextBuildOptions = {
      ...request.context,
      maxChars: plan.budget.maxChars,
      includeSummaryOnly: !plan.hydrateBody,
    };

    const memoriesForContext = plan.hydrateBody
      ? await this.hydrateRankedMemories(scope, selected, contextOptions)
      : selected;
    const context = this.contextBuilder.build(memoriesForContext, contextOptions);

    const workspaceId = workspaceIdFromScope(scope);
    const memoryIds = selected.map((memory) => memory.id);
    await this.repository.recordAccessBatch(memoryIds, scope.ownerId, workspaceId);

    if (this.memoryAccessAuditor) {
      await Promise.all(
        selected.map((memory) =>
          this.memoryAccessAuditor!.recordAccess({
            memoryId: memory.id,
            ownerId: scope.ownerId,
            workspaceId,
            source: 'context.build',
            identityId: request.auditIdentityId,
            ipAddress: request.auditIpAddress,
          }),
        ),
      );
    }

    const envelope = createContextPackageEnvelope({
      scope,
      query: request.query ?? '',
      memories: selected,
    });

    if (this.lifecycleStore) {
      await this.lifecycleStore.insertActive({
        packageId: envelope.packageId,
        ownerId: envelope.ownerId,
        createdAt: envelope.createdAt,
      });
    }

    return {
      ...envelope,
      context,
      memories: selected,
      totalCandidates,
      retrievalPlan: plan,
      retrievalMemo,
    };
  }

  async getPackageLifecycle(
    scope: MemoryScope,
    packageId: string,
  ): Promise<ContextPackageLifecycleRecord> {
    const store = this.requireLifecycleStore();
    const record = await store.get(scope.ownerId, packageId);
    if (!record) {
      throw new NotFoundError('ContextPackage', packageId);
    }
    return record;
  }

  async retirePackage(
    scope: MemoryScope,
    packageId: string,
  ): Promise<ContextPackageLifecycleRecord> {
    return this.transitionPackage(scope, packageId, 'retired');
  }

  async archivePackage(
    scope: MemoryScope,
    packageId: string,
  ): Promise<ContextPackageLifecycleRecord> {
    return this.transitionPackage(scope, packageId, 'archived');
  }

  private async transitionPackage(
    scope: MemoryScope,
    packageId: string,
    to: ContextPackageLifecycleState,
  ): Promise<ContextPackageLifecycleRecord> {
    const store = this.requireLifecycleStore();
    const current = await store.get(scope.ownerId, packageId);
    if (!current) {
      throw new NotFoundError('ContextPackage', packageId);
    }
    if (!canTransitionContextPackageLifecycle(current.lifecycleState, to)) {
      throw new ConflictError(
        `Invalid Context Package lifecycle transition: ${current.lifecycleState} → ${to}`,
      );
    }
    const updatedAt = new Date().toISOString();
    const ok = await store.updateState(scope.ownerId, packageId, to, updatedAt);
    if (!ok) {
      throw new NotFoundError('ContextPackage', packageId);
    }
    return {
      ...current,
      lifecycleState: to,
      updatedAt,
    };
  }

  private requireLifecycleStore(): IContextPackageLifecycleStore {
    if (!this.lifecycleStore) {
      throw new ConflictError('Context Package lifecycle store is not configured');
    }
    return this.lifecycleStore;
  }

  async buildPrompt(
    scope: MemoryScope,
    request: BuildContextRequest & { task: string; systemRole?: string },
  ): Promise<BuildPromptResult> {
    const built = await this.buildContext(scope, {
      ...request,
      query: request.query ?? request.task,
    });
    const prompt = this.promptBuilder.build({
      systemRole: request.systemRole,
      contextBlock: built.context,
      userTask: request.task,
      projectId: request.projectId,
    });

    return {
      ...built,
      system: prompt.system,
      user: prompt.user,
    };
  }

  private async hydrateRankedMemories(
    scope: MemoryScope,
    ranked: ScoredMemory[],
    _options: ContextBuildOptions,
  ): Promise<ScoredMemory[]> {
    if (ranked.length === 0) {
      return ranked;
    }

    const workspaceId = workspaceIdFromScope(scope);
    const hydrated = await this.repository.findByIdsWithContent(
      ranked.map((memory) => memory.id),
      scope.ownerId,
      workspaceId,
    );
    const contentById = new Map(hydrated.map((memory) => [memory.id, memory.content]));

    return ranked.map((memory) =>
      contentById.has(memory.id) ? { ...memory, content: contentById.get(memory.id)! } : memory,
    );
  }
}
