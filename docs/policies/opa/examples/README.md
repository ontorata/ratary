# OPA policy examples

Sample **Rego** packages for [Open Policy Agent](https://www.openpolicyagent.org/). Ratary does **not** read this folder directly — you load bundles into a running **OPA server**, then point Ratary at it with `OPA_URL`.

See [../../README.md](../../README.md) for the full authorization policy workflow.

---

## Files

| File | Package | Purpose |
|------|---------|---------|
| [plugin-deny.rego](plugin-deny.rego) | `ratary.authz` | Deny `plugin.enable` when plugin id is in `data.blocked_plugin_ids` |

---

## Wire-up

**.env (Ratary):**

```env
ENTERPRISE_SECURITY_V2=true
POLICY_ENGINE=opa
OPA_URL=http://127.0.0.1:8181
```

**OPA (Docker example):**

```bash
docker run --rm -p 8181:8181 \
  -v "$(pwd)/docs/policies/opa/examples:/policies" \
  openpolicyagent/opa:latest run --server /policies
```

Ratary evaluates via `POST /v1/data/ratary/authz` — see `OpaPolicyEngine` in `src/security/adapters/opa-policy-engine.ts`.

Copy these files into your own policy repository for production; treat this directory as starters only.
