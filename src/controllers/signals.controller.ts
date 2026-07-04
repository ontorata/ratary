import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IMemorySignalIngestor } from '../ingest/imemory-signal-ingestor.interface.js';
import type { ISignalNormalizer } from '../ingest/isignal-normalizer.interface.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import { resolveMemoryScopeFromRequest } from '../scope/resolve-request-scope.js';
import { ValidationError } from '../types/errors.js';

import type { LearningEventRecorder } from '../learning/learning-event-recorder.js';

export function createSignalsController(
  scopeResolver: IScopeResolver,
  normalizer: ISignalNormalizer,
  ingestor: IMemorySignalIngestor,
  options?: { eventRecorder?: LearningEventRecorder },
) {
  return {
    async ingest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const signal = normalizer.normalize(request.body, {
        ownerId: scope.ownerId,
        workspaceId: scope.workspaceId,
      });

      if (!signal) {
        throw new ValidationError('Invalid signal payload');
      }

      const result = await ingestor.ingest(scope, signal);
      if (options?.eventRecorder) {
        await options.eventRecorder.recordFromSignal(scope, signal, result);
      }
      reply.send(result);
    },
  };
}

export type SignalsController = ReturnType<typeof createSignalsController>;
