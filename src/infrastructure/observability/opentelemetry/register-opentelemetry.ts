import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import type { Env } from '../../../config/env.js';
import { isOpenTelemetryEnabled, markOpenTelemetryStarted } from './otel-state.js';

let sdk: NodeSDK | null = null;

/**
 * Initializes OpenTelemetry SDK (ADR-008 / IMPLEMENTATION C12).
 * Call once before Fastify starts when OTEL_ENABLED=true.
 */
export function registerOpenTelemetry(env: Env): void {
  if (!isOpenTelemetryEnabled(env) || sdk) {
    return;
  }

  const exporter = new OTLPTraceExporter({
    url: env.OTEL_EXPORTER_OTLP_ENDPOINT,
  });

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: env.OTEL_SERVICE_NAME,
    }),
    traceExporter: exporter,
  });

  sdk.start();
  markOpenTelemetryStarted();
}

export async function shutdownOpenTelemetry(): Promise<void> {
  if (!sdk) {
    return;
  }
  await sdk.shutdown();
  sdk = null;
}
