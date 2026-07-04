/**
 * Strangler re-export (ADR-027 Phase 10.5C).
 * Canonical REST bootstrap now lives in `transport/rest/`.
 * Legacy import path `./server.js` is preserved for existing consumers
 * (api/index.ts, dev-server.ts, tests).
 */
export { buildApp, type AppDependencies } from './transport/rest/rest-server.js';
