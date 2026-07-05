import type { Env } from '../../config/env.js';
import type { IInspectionPatternStore } from './iinspection-pattern-store.interface.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import type { InspectionPattern } from './inspection-pattern.types.js';
import { INSPECTION_CHARTER_WORKSPACE_THRESHOLD } from './inspection-ledger.constants.js';

export class CharterPatternPromoter {
  constructor(
    private readonly store: IInspectionPatternStore,
    private readonly env: Env,
  ) {}

  async promote(
    scope: MemoryScope,
    patterns: readonly InspectionPattern[],
    dryRun: boolean,
  ): Promise<number> {
    if (!this.env.INSPECTION_CHARTER_ENABLED || !this.env.FEDERATION_ENABLED) {
      return 0;
    }

    let promoted = 0;
    const now = new Date().toISOString();

    for (const pattern of patterns) {
      if (pattern.patternScope !== 'workspace' || !pattern.workspaceId) {
        continue;
      }
      const workspaceCount = await this.store.countWorkspacesByPatternKey(
        scope.ownerId,
        pattern.patternKey,
      );
      if (workspaceCount < INSPECTION_CHARTER_WORKSPACE_THRESHOLD) {
        continue;
      }

      const existing = await this.store.findByPatternKey(scope, pattern.patternKey, 'organization');
      if (existing) {
        continue;
      }

      promoted++;
      if (dryRun) {
        continue;
      }

      await this.store.upsert({
        ...pattern,
        id: crypto.randomUUID(),
        patternScope: 'organization',
        workspaceId: undefined,
        organizationId: scope.organizationId,
        protected: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    return promoted;
  }
}
