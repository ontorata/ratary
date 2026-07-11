# P1-A Org Memory Dogfood — Recall Log

| Field | Value |
|-------|-------|
| **Status** | Active |
| **Schema** | `run_id`, `query_count`, `successful_recalls`, `failed_recalls`, `missing_sources`, `avg_latency_ms`, `pass_rate` |
| **Mode** | deterministic fixture dataset |

---

## run_id=3e3951d1-89d3-4dc1-b075-0fac8ff7ab93

- fixture_version=2026-07-08
- ingestion_run_id=06eab23e-5517-4380-af7f-eacfc97185c9
- query_count=3
- successful_recalls=2
- failed_recalls=1
- missing_sources=1
- avg_latency_ms=2.33
- pass_rate=66.67

| query | gate | successful | latency_ms | evidence_count | missing_sources |
|-------|------|------------|------------|----------------|-----------------|
| query_id=q-g2-adr-recall | gate=G2 | successful=true | latency_ms=7 | evidence_count=3 | missing_sources=0 |
| query_id=q-g3-release-history | gate=G3 | successful=true | latency_ms=0 | evidence_count=3 | missing_sources=0 |
| query_id=q-g4-evidence-answer | gate=G4 | successful=false | latency_ms=0 | evidence_count=3 | missing_sources=1 |

## run_id=1ed2b83d-fbcb-4153-ab99-0a67d274c29c

- fixture_version=2026-07-08
- ingestion_run_id=06eab23e-5517-4380-af7f-eacfc97185c9
- query_count=3
- successful_recalls=3
- failed_recalls=0
- missing_sources=0
- avg_latency_ms=2.67
- pass_rate=100

| query | gate | successful | latency_ms | evidence_count | missing_sources |
|-------|------|------------|------------|----------------|-----------------|
| query_id=q-g2-adr-recall | gate=G2 | successful=true | latency_ms=8 | evidence_count=4 | missing_sources=0 |
| query_id=q-g3-release-history | gate=G3 | successful=true | latency_ms=0 | evidence_count=4 | missing_sources=0 |
| query_id=q-g4-evidence-answer | gate=G4 | successful=true | latency_ms=0 | evidence_count=4 | missing_sources=0 |

