# OPA policy examples

Bundled Rego samples for `OPA_POLICY_ENGINE` integration and tenant policy authoring.

| File | Purpose |
|------|---------|
| [plugin-deny.rego](plugin-deny.rego) | Deny `plugin.enable` when plugin id is in `data.blocked_plugin_ids` |

Load at runtime when the OPA adapter is enabled:

```env
OPA_POLICY_BUNDLE_PATH=docs/policies/opa/examples
```

Use these as starting points for custom authorization rules — copy and extend for your deployment.
