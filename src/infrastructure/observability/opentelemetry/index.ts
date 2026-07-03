export { registerOpenTelemetry, shutdownOpenTelemetry } from './register-opentelemetry.js';
export { openTelemetryFastifyPlugin } from './fastify-otel.plugin.js';
export {
  isOpenTelemetryEnabled,
  isOpenTelemetryStarted,
  resetOpenTelemetryStateForTests,
} from './otel-state.js';
