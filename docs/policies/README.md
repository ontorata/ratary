# Authorization Policies

**Purpose:** Example **[authorization policy](https://www.openpolicyagent.org/)** bundles (Rego) for enterprise deployments.  
**Not:** environment variables, npm policies, or Ratary memory rules.

---

## Why this folder is named `policies`

In Ratary, **policy** means *who may do what* on the API (enable plugin, access workspace, etc.) — evaluated by a **policy engine** when enterprise security is enabled (`ENTERPRISE_SECURITY_V2=true`).

| Term in repo | Meaning |
|--------------|---------|
| **`docs/policies/`** | Sample **Rego** rules you deploy to **Open Policy Agent (OPA)** |
| **`POLICY_ENGINE` in `.env`** | Which engine Ratary calls (`none`, `rule-based`, `opa`, …) |
| **`docs/examples/`** | MCP/IDE **config templates** — unrelated to authorization |

So: **`policies/` = authorization samples**, not configuration templates.

---

## When you need this

| Audience | Need policies folder? |
|----------|------------------------|
| Solo dev, D1, MCP only | **No** — keep `POLICY_ENGINE=none` (default) |
| Enterprise with OPA / ABAC | **Yes** — start from [opa/examples/](opa/examples/) |

---

## How to use (OPA path)

1. Enable security in `.env`:

```env
ENTERPRISE_SECURITY_V2=true
POLICY_ENGINE=opa
OPA_URL=http://127.0.0.1:8181
```

2. Run OPA with the sample bundle mounted (example):

```bash
docker run --rm -p 8181:8181 \
  -v "%cd%/docs/policies/opa/examples:/policies" \
  openpolicyagent/opa:latest run --server /policies
```

3. Ratary calls `POST {OPA_URL}/v1/data/ratary/authz` with request context. Sample package: `ratary.authz` in [plugin-deny.rego](opa/examples/plugin-deny.rego).

4. Copy and extend Rego for your tenant rules — do not edit samples in place for production; fork to your own bundle repo.

Full env reference: [CONFIGURATION — Tier 5](../CONFIGURATION.md#tier-5--enterprise-security).

---

## Contents

| Path | Description |
|------|-------------|
| [opa/examples/](opa/examples/) | Starter Rego — plugin deny list, authz patterns |
| [opa/examples/README.md](opa/examples/README.md) | Per-file reference |

---

*Runtime policy evaluation: `src/security/adapters/opa-policy-engine.ts`. Samples are documentation + test fixtures, not loaded automatically by Ratary Server.*
