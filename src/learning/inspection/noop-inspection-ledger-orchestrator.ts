import type { IInspectionLedgerOrchestrator } from './iinspection-ledger-orchestrator.interface.js';
import type { InspectionLedgerRunOptions, InspectionLedgerRunReport } from './inspection-pattern.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';

export class NoOpInspectionLedgerOrchestrator implements IInspectionLedgerOrchestrator {
  async run(scope: MemoryScope, options: InspectionLedgerRunOptions): Promise<InspectionLedgerRunReport> {
    return {
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      dryRun: options.dryRun,
      eventsScanned: 0,
      patternsUpserted: 0,
      contradictionsFound: 0,
      charterPromoted: 0,
      confidenceRefreshed: 0,
    };
  }
}
