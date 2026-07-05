# @ratary/cli

Command-line interface for [Ratary Server](https://github.com/ontorata/ratary). Delegates to `@ratary/sdk`.

```bash
npm install -g @ratary/cli
```

**npm:** [npmjs.com/package/@ratary/cli](https://www.npmjs.com/package/@ratary/cli)

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

## License

MIT · [ontorata/ratary](https://github.com/ontorata/ratary)
