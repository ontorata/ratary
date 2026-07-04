import type { DomainEventPublisher } from '../../../events/domain-event-publisher.js';
import type { LearningEventRecorder } from '../../../learning/learning-event-recorder.js';
import type { IScopeResolver } from '../../../scope/iscope-resolver.interface.js';
import type { IMemorySignalIngestor } from '../../../ingest/imemory-signal-ingestor.interface.js';
import type { ISignalNormalizer } from '../../../ingest/isignal-normalizer.interface.js';
import { processSignalIngest } from '../../../ingest/process-signal-ingest.js';
import type { IngestResult } from '../../../ingest/memory-quality-signal.types.js';
import type { IApplicationHandler } from '../iapplication-handler.interface.js';
import { resolveHandlerScope } from './resolve-handler-scope.js';

export type SubmitSignalInput =
  | {
      type: 'explicit_feedback';
      memoryId: string;
      value: 'helpful' | 'not_helpful';
      signalId?: string;
    }
  | {
      type: 'inspection_outcome';
      source: 'forge_inspect' | 'ci' | 'mcp' | 'rest';
      taskId?: string;
      severity: 'constitutional' | 'critical' | 'major';
      category: 'boundary' | 'adr' | 'testing' | 'security' | 'phase_gate';
      resolved: boolean;
      diffScope?: { paths?: string[]; modules?: string[]; adrIds?: string[] };
      patternHint?: string;
      signalId?: string;
    };

export interface SignalHandlerDeps {
  scopeResolver: IScopeResolver;
  normalizer: ISignalNormalizer;
  ingestor: IMemorySignalIngestor;
  eventRecorder?: LearningEventRecorder;
  domainEventPublisher?: DomainEventPublisher;
}

export interface SignalHandlers {
  submit: IApplicationHandler<SubmitSignalInput, IngestResult>;
}

export function createSignalHandlers(deps: SignalHandlerDeps): SignalHandlers {
  const ingestDeps = {
    normalizer: deps.normalizer,
    ingestor: deps.ingestor,
    eventRecorder: deps.eventRecorder,
    domainEventPublisher: deps.domainEventPublisher,
  };

  return {
    submit: {
      handle: async (ctx, input) =>
        processSignalIngest(await resolveHandlerScope(ctx, deps.scopeResolver), input, ingestDeps),
    },
  };
}
