# @ratary/cli

Command-line interface for [Ratary Server](https://github.com/ontorata/ratary). Delegates to `@ratary/sdk@1.1.0`.

```bash
npm install -g @ratary/cli@1.1.0
```

**npm:** [@ratary/cli@1.1.0](https://www.npmjs.com/package/@ratary/cli)

---

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `RATARY_BASE_URL` | yes | Ratary Server base URL |
| `RATARY_API_KEY` | yes | API key (`aic_...`) |
| `RATARY_WORKSPACE_ID` | no | Workspace scope |

```bash
export RATARY_BASE_URL=https://ratary.example.com
export RATARY_API_KEY=aic_...
ratary --help
```

---

## Commands (v1.1.0)

Requires server with matching routes; knowledge fabric needs `KNOWLEDGE_FABRIC_ENABLED=true`.

```bash
ratary admin cloud status
ratary admin observability status
ratary admin knowledge-fabric status
ratary admin knowledge-fabric connectors
ratary connectors sync notion --mode incremental --dry-run
ratary connectors list
ratary connectors state notion
```

---

## License

MIT · [ontorata/ratary](https://github.com/ontorata/ratary)
