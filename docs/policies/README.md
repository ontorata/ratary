# Policies

Example authorization policies for enterprise deployments (OPA / Rego).

| Path | Description |
|------|-------------|
| [opa/examples/](opa/examples/) | Sample Rego bundles — plugin deny rules, tenant authz patterns |

Enable via `OPA_POLICY_BUNDLE_PATH` when `ENTERPRISE_SECURITY_V2` and OPA adapter are active. See [.env.example](../../.env.example) for related flags.
