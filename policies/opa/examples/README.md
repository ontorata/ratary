# OPA Policy Examples (Phase 17)

Bundled Rego samples for `OPA_POLICY_ENGINE` integration tests and tenant policy authoring.

| File | Purpose |
|------|---------|
| [plugin-deny.rego](plugin-deny.rego) | Deny `plugin.enable` when plugin id is in `data.blocked_plugin_ids` |

Load at runtime via `OPA_POLICY_BUNDLE_PATH=policies/opa/examples` (when OPA adapter enabled).

See [ADR-032](../../.ai/adr/032-enterprise-security.md) and `tests/security/opa-policy-engine.test.ts`.
