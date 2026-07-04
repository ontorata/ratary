import type {
  ConflictResolution,
  ConflictResolutionContext,
  IConflictResolver,
} from './iconflict-resolver.interface.js';

/** Rejects stale writes — strict last-write-wins at reconcile time. */
export class LastWriteWinsResolver implements IConflictResolver {
  async resolve(context: ConflictResolutionContext): Promise<ConflictResolution> {
    if (!context.isStale) {
      return { result: 'accept' };
    }
    return { result: 'reject' };
  }
}

/** Accepts stale writes — field merge applied at push layer. */
export class FieldMergeResolver implements IConflictResolver {
  async resolve(_context: ConflictResolutionContext): Promise<ConflictResolution> {
    return { result: 'accept' };
  }
}

/** Rejects stale writes and queues for manual resolution. */
export class ManualQueueResolver implements IConflictResolver {
  async resolve(context: ConflictResolutionContext): Promise<ConflictResolution> {
    if (!context.isStale) {
      return { result: 'accept' };
    }
    return { result: 'reject', queue: true };
  }
}
