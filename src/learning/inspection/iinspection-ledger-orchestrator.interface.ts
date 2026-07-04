import type { MemoryScope } from '../../types/memory-scope.js';
import type {
  InspectionLedgerRunOptions,
  InspectionLedgerRunReport,
} from './inspection-pattern.types.js';

export interface IInspectionLedgerOrchestrator {
  run(scope: MemoryScope, options: InspectionLedgerRunOptions): Promise<InspectionLedgerRunReport>;
}
