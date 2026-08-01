# Decision model catalog sync (PI-P6-D0)

**SoT:** `ontory-runtime/src/agent/decision-model/decision-model-manifest.ts`

**Mirror:** `src/decision-intelligence/decision-model-catalog.ts` (Ratary REST list)

When adding or changing a declarative profile in Ontory:

1. Update ontory `DECISION_MODEL_MANIFEST` + tests.
2. Copy public catalog fields to Ratary `DECISION_MODEL_CATALOG_MIRROR`.
3. Enable via deployment env `DECISION_MODEL_ALLOWLIST` (comma-separated model ids).

No cross-repo import at runtime in v1.
