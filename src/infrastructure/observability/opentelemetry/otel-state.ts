import type { Env } from '../../../config/env.js';

let started = false;

export function isOpenTelemetryEnabled(env: Env): boolean {
  return env.OTEL_ENABLED;
}

export function markOpenTelemetryStarted(): void {
  started = true;
}

export function isOpenTelemetryStarted(): boolean {
  return started;
}

export function resetOpenTelemetryStateForTests(): void {
  started = false;
}
