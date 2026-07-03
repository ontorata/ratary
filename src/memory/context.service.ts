import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { MemoryScope } from '../types/memory-scope.js';
import { workspaceIdFromScope } from '../repositories/repository-scope.js';
import type { MemoryLevel } from '../types/memory-level.js';
import { Retriever } from './retriever.js';
import { SqlRetrievalCandidateSource } from './sql-retrieval-candidate-source.js';
import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';
import { Ranker, type ScoredMemory } from './ranker.js';
import { ContextBuilder, type ContextBuildOptions } from './context-builder.js';
import { PromptBuilder } from './prompt-builder.js';
import { DEFAULT_RETRIEVAL_RANK_LIMIT } from './context.config.js';

export interface BuildContextRequest {
  projectId?: string;
  query?: string;
  tags?: string[];
  levels?: MemoryLevel[];
  limit?: number;
  context?: ContextBuildOptions;
}

export interface BuildContextResult {
  context: string;
  memories: ScoredMemory[];
  totalCandidates: number;
}

export interface BuildPromptResult extends BuildContextResult {
  system: string;
  user: string;
}

export class ContextService {
  private readonly retriever: Retriever;
  private readonly ranker: Ranker;
  private readonly contextBuilder: ContextBuilder;
  private readonly promptBuilder: PromptBuilder;

  constructor(
    private readonly repository: IMemoryRepository,
    candidateSource?: IRetrievalCandidateSource,
  ) {
    this.retriever = new Retriever(candidateSource ?? new SqlRetrievalCandidateSource(repository));
    this.ranker = new Ranker();
    this.contextBuilder = new ContextBuilder();
    this.promptBuilder = new PromptBuilder();
  }

  async buildContext(
    scope: MemoryScope,
    request: BuildContextRequest,
  ): Promise<BuildContextResult> {
    const candidates = await this.retriever.retrieve({
      scope,
      projectId: request.projectId,
      query: request.query,
      tags: request.tags,
      levels: request.levels,
      limit: request.limit,
    });

    const ranked = this.ranker.rank(
      candidates,
      { q: request.query, tag: request.tags?.[0] },
      request.limit ?? DEFAULT_RETRIEVAL_RANK_LIMIT,
    );

    const context = this.contextBuilder.build(ranked, request.context);

    await Promise.all(
      ranked.map((memory) =>
        this.repository.recordAccess(memory.id, scope.ownerId, workspaceIdFromScope(scope)),
      ),
    );

    return {
      context,
      memories: ranked,
      totalCandidates: candidates.length,
    };
  }

  async buildPrompt(
    scope: MemoryScope,
    request: BuildContextRequest & { task: string; systemRole?: string },
  ): Promise<BuildPromptResult> {
    const built = await this.buildContext(scope, request);
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
}
