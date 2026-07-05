import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { IEventConsumer } from '../events/ievent-consumer.interface.js';
import type { IMetricsExporter } from '../observability/ports/imetrics-exporter.port.js';
import type { IKnowledgeExchangeService } from '../federation/ports/iknowledge-exchange.port.js';
import type { IUsageMeter } from '../cloud/ports/iusage-meter.port.js';
import type { MemoryService } from '../services/memory.service.js';
import {
  DefaultTelemetryRedactor,
  GlobalIntelligenceManifestBuilder,
  GlobalSyncOrchestrator,
  IntelligenceTelemetryConsumer,
  NoOpGlobalSyncOrchestrator,
  NoOpOfflineJournal,
  NoOpTelemetryRecorder,
  NoOpTelemetrySink,
  NoOpUsageAnalyticsService,
  PrometheusTelemetrySink,
  SqlOfflineJournal,
  TelemetryRecorder,
  UsageAnalyticsService,
} from '../intelligence/index.js';
import type { ITelemetryRecorder } from '../intelligence/telemetry/ports/itelemetry.port.js';
import type { IUsageAnalyticsService } from '../intelligence/analytics/ports/iusage-analytics.port.js';
import type {
  IGlobalSyncOrchestrator,
  IOfflineJournal,
} from '../intelligence/sync/ports/iglobal-sync.port.js';
import {
  NoOpIntelligenceStore,
  SqlIntelligenceStore,
} from '../infrastructure/intelligence/sql-intelligence-store.js';

export interface GlobalIntelligencePorts {
  enabled: boolean;
  telemetryRecorder: ITelemetryRecorder;
  analyticsService: IUsageAnalyticsService;
  syncOrchestrator: IGlobalSyncOrchestrator;
  offlineJournal: IOfflineJournal;
  manifestBuilder: GlobalIntelligenceManifestBuilder;
  telemetryConsumer: IEventConsumer | null;
  bindExchange(memoryService: MemoryService, createExchange: () => IKnowledgeExchangeService): void;
}

/**
 * Composition root for Phase 25 global AI intelligence capstone (ADR-036).
 * Gated by GLOBAL_INTELLIGENCE_PLATFORM_ENABLED — default off preserves pre-Phase-25 behavior.
 */
export interface GlobalIntelligencePortDeps {
  usageMeter?: IUsageMeter;
  usageMeterEnabled?: boolean;
}

export function createGlobalIntelligencePorts(
  sql: ISqlDatabase,
  env: Env,
  metricsExporter?: IMetricsExporter,
  deps?: GlobalIntelligencePortDeps,
): GlobalIntelligencePorts {
  const noopStore = new NoOpIntelligenceStore();
  const noop: GlobalIntelligencePorts = {
    enabled: false,
    telemetryRecorder: new NoOpTelemetryRecorder(),
    analyticsService: new NoOpUsageAnalyticsService(),
    syncOrchestrator: new NoOpGlobalSyncOrchestrator(),
    offlineJournal: new NoOpOfflineJournal(),
    manifestBuilder: new GlobalIntelligenceManifestBuilder(env, noopStore),
    telemetryConsumer: null,
    bindExchange: () => undefined,
  };

  if (!env.GLOBAL_INTELLIGENCE_PLATFORM_ENABLED) {
    return noop;
  }

  const store = new SqlIntelligenceStore(sql);
  const redactor = new DefaultTelemetryRedactor();
  const sinks = [
    new NoOpTelemetrySink(),
    ...(metricsExporter
      ? [
          new PrometheusTelemetrySink((name, labels) => {
            metricsExporter.incrementCounter({ name, labels });
          }),
        ]
      : []),
  ];

  const telemetryRecorder = new TelemetryRecorder(
    env.FEDERATION_NODE_ID,
    redactor,
    sinks,
    store,
    true,
  );

  const analyticsService = new UsageAnalyticsService(
    store,
    deps?.usageMeter,
    deps?.usageMeterEnabled ?? false,
  );
  const syncOrchestrator = new GlobalSyncOrchestrator(null, store, env.FEDERATION_NODE_ID);
  const offlineJournal = new SqlOfflineJournal(sql);
  const manifestBuilder = new GlobalIntelligenceManifestBuilder(env, store);
  const telemetryConsumer = new IntelligenceTelemetryConsumer(telemetryRecorder);

  return {
    enabled: true,
    telemetryRecorder,
    analyticsService,
    syncOrchestrator,
    offlineJournal,
    manifestBuilder,
    telemetryConsumer,
    bindExchange(_memoryService, createExchange) {
      syncOrchestrator.setExchange(createExchange());
    },
  };
}
