# Decision model catalog sync (PI-P6-D0 / D1)

**SoT:** `ontory-runtime/src/agent/decision-model/decision-model-manifest.ts`

**Mirror:** `src/decision-intelligence/decision-model-catalog.ts` (Ratary REST list)

When adding or changing a declarative or computed profile in Ontory:

1. Update ontory `DECISION_MODEL_MANIFEST` + plugin digest (`npm run verify:decision-model-plugins`).
2. Copy public catalog fields to Ratary `DECISION_MODEL_CATALOG_MIRROR` (include `computedPlugin.artifactDigestPrefix` for computed models).
3. Enable via deployment env `DECISION_MODEL_ALLOWLIST`:
   - `model-id` — all authorized manifest versions for that id (PI-P6-D2)
   - `model-id@semver` — pin exact version only
4. For computed models, enable sandbox on Ontory VPS: `DECISION_MODEL_SANDBOX_ENABLED=true` (execution stays Ontory; Ratary only mirrors catalog metadata).
5. **PI-P6-D1.1 re-rank:** On Ratary set `ONTORY_SANDBOX_BRIDGE_ENABLED=true`, `ONTORY_RUNTIME_URL` (Ontory VPS), and matching `ONTORY_DECISION_MODEL_SANDBOX_TOKEN` on both Ratary and Ontory.
6. **PI-P6-D2:** When multiple versions share an id, Studio picker uses `id@version` ref keys; sync all versions to Ratary mirror.

No cross-repo import at runtime in v1.
