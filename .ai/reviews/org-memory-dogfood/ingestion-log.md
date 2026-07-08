# P1-A Org Memory Dogfood — Ingestion Log

| Field | Value |
|-------|-------|
| **Status** | Active |
| **Schema** | `run_id`, `source_path`, `ingested`, `failed` |

---

## run_id=216b9bd4-1b62-4929-8032-9909a2019fb2

- started_at: 2026-07-08T05:04:32.868Z
- ended_at: 2026-07-08T05:04:32.926Z
- ingested=142
- failed=0
- digest=22433459a28d62e5

| source_path | ingested | failed | duration_ms |
|-------------|----------|--------|-------------|
| source_path=`.ai/core/` | ingested=93 | failed=0 | duration_ms=44 |
| source_path=`docs/architecture/` | ingested=5 | failed=0 | duration_ms=3 |
| source_path=`.ai/core/architecture/ADR-*.md` | ingested=6 | failed=0 | duration_ms=1 |
| source_path=`.ai/governance/releases/` | ingested=8 | failed=0 | duration_ms=3 |
| source_path=`.ai/reviews/` | ingested=29 | failed=0 | duration_ms=7 |
| source_path=`.ai/sessions/CURRENT.md` | ingested=1 | failed=0 | duration_ms=0 |

## run_id=06eab23e-5517-4380-af7f-eacfc97185c9

- started_at: 2026-07-08T05:05:13.353Z
- ended_at: 2026-07-08T05:05:13.390Z
- ingested=143
- failed=0
- digest=ac7b5ea7afd0bfd8

| source_path | ingested | failed | duration_ms |
|-------------|----------|--------|-------------|
| source_path=`.ai/core/` | ingested=93 | failed=0 | duration_ms=24 |
| source_path=`docs/architecture/` | ingested=5 | failed=0 | duration_ms=1 |
| source_path=`.ai/core/architecture/ADR-*.md` | ingested=6 | failed=0 | duration_ms=3 |
| source_path=`.ai/governance/releases/` | ingested=8 | failed=0 | duration_ms=2 |
| source_path=`.ai/reviews/` | ingested=30 | failed=0 | duration_ms=6 |
| source_path=`.ai/sessions/CURRENT.md` | ingested=1 | failed=0 | duration_ms=1 |

## run_id=37278681-9d36-4882-ac33-9032fc116295

- started_at: 2026-07-08T06:44:28.914Z
- ended_at: 2026-07-08T06:44:29.019Z
- ingested=155
- failed=0
- digest=590ec2fdc1d7a706

| source_path | ingested | failed | duration_ms |
|-------------|----------|--------|-------------|
| source_path=`.ai/core/` | ingested=94 | failed=0 | duration_ms=75 |
| source_path=`docs/architecture/` | ingested=5 | failed=0 | duration_ms=5 |
| source_path=`.ai/core/architecture/ADR-*.md` | ingested=7 | failed=0 | duration_ms=2 |
| source_path=`.ai/governance/releases/` | ingested=9 | failed=0 | duration_ms=5 |
| source_path=`.ai/reviews/` | ingested=39 | failed=0 | duration_ms=17 |
| source_path=`.ai/sessions/CURRENT.md` | ingested=1 | failed=0 | duration_ms=0 |

| stage | status | processed | failed | checkpoint_id | source_path |
|-------|--------|-----------|--------|---------------|-------------|
| stage=source_intake | status=completed | processed=94 | failed=0 | checkpoint_id=`cp-29c5f6987e3e3e3c` | source_path=`.ai/core/` |
| stage=normalizer | status=completed | processed=94 | failed=0 | checkpoint_id=`cp-0a7cfb52cfcc454e` | source_path=`.ai/core/` |
| stage=chunk_builder | status=completed | processed=271 | failed=0 | checkpoint_id=`cp-cfc9925b624c02b7` | source_path=`.ai/core/` |
| stage=embedding_generator | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-64a6ea0b1c3d8b17` | source_path=`.ai/core/` |
| stage=knowledge_store | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-e9474a3d470545ab` | source_path=`.ai/core/` |
| stage=index_update | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-37b586407ef2ec3c` | source_path=`.ai/core/` |
| stage=source_intake | status=completed | processed=5 | failed=0 | checkpoint_id=`cp-137632e5881d74f6` | source_path=`docs/architecture/` |
| stage=normalizer | status=completed | processed=5 | failed=0 | checkpoint_id=`cp-144a63f6a2432e87` | source_path=`docs/architecture/` |
| stage=chunk_builder | status=completed | processed=14 | failed=0 | checkpoint_id=`cp-082f37eb34815d6d` | source_path=`docs/architecture/` |
| stage=embedding_generator | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-559e087e47519f41` | source_path=`docs/architecture/` |
| stage=knowledge_store | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-eb6fc43bb1c53504` | source_path=`docs/architecture/` |
| stage=index_update | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-a754b793fbcd71b4` | source_path=`docs/architecture/` |
| stage=source_intake | status=completed | processed=7 | failed=0 | checkpoint_id=`cp-76019c429ac0da83` | source_path=`.ai/core/architecture/ADR-*.md` |
| stage=normalizer | status=completed | processed=7 | failed=0 | checkpoint_id=`cp-e7eabf1f99f98ca7` | source_path=`.ai/core/architecture/ADR-*.md` |
| stage=chunk_builder | status=completed | processed=17 | failed=0 | checkpoint_id=`cp-5e04e465b1921d3c` | source_path=`.ai/core/architecture/ADR-*.md` |
| stage=embedding_generator | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-a91088953c8097c2` | source_path=`.ai/core/architecture/ADR-*.md` |
| stage=knowledge_store | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-d2704a860f91a396` | source_path=`.ai/core/architecture/ADR-*.md` |
| stage=index_update | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-68d85f699a906d4b` | source_path=`.ai/core/architecture/ADR-*.md` |
| stage=source_intake | status=completed | processed=9 | failed=0 | checkpoint_id=`cp-f5fa49aff61a414e` | source_path=`.ai/governance/releases/` |
| stage=normalizer | status=completed | processed=9 | failed=0 | checkpoint_id=`cp-1a3aeba3904f873b` | source_path=`.ai/governance/releases/` |
| stage=chunk_builder | status=completed | processed=37 | failed=0 | checkpoint_id=`cp-59bcab5e475aec97` | source_path=`.ai/governance/releases/` |
| stage=embedding_generator | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-f6cb40e7b25b4afa` | source_path=`.ai/governance/releases/` |
| stage=knowledge_store | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-e6b132cb0dafcb3c` | source_path=`.ai/governance/releases/` |
| stage=index_update | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-a188c878cb6e39ab` | source_path=`.ai/governance/releases/` |
| stage=source_intake | status=completed | processed=39 | failed=0 | checkpoint_id=`cp-afebe8e9c4830752` | source_path=`.ai/reviews/` |
| stage=normalizer | status=completed | processed=39 | failed=0 | checkpoint_id=`cp-7d45bf84639c74e3` | source_path=`.ai/reviews/` |
| stage=chunk_builder | status=completed | processed=80 | failed=0 | checkpoint_id=`cp-487218059484da5b` | source_path=`.ai/reviews/` |
| stage=embedding_generator | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-42fd8f78009fce14` | source_path=`.ai/reviews/` |
| stage=knowledge_store | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-d071b394743ac148` | source_path=`.ai/reviews/` |
| stage=index_update | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-66abb16a5051770d` | source_path=`.ai/reviews/` |
| stage=source_intake | status=completed | processed=1 | failed=0 | checkpoint_id=`cp-2584abb162c28c6f` | source_path=`.ai/sessions/CURRENT.md` |
| stage=normalizer | status=completed | processed=1 | failed=0 | checkpoint_id=`cp-5c6787b4b8f1cd4c` | source_path=`.ai/sessions/CURRENT.md` |
| stage=chunk_builder | status=completed | processed=6 | failed=0 | checkpoint_id=`cp-5041a09908309b68` | source_path=`.ai/sessions/CURRENT.md` |
| stage=embedding_generator | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-2aa7b98a796632c9` | source_path=`.ai/sessions/CURRENT.md` |
| stage=knowledge_store | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-96ef5a0bbb5ec234` | source_path=`.ai/sessions/CURRENT.md` |
| stage=index_update | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-7de18eecd9f19c12` | source_path=`.ai/sessions/CURRENT.md` |

## run_id=dca907d1-b157-4bd5-845b-043ca8fd630f

- started_at: 2026-07-08T06:46:15.988Z
- ended_at: 2026-07-08T06:46:16.058Z
- ingested=155
- failed=0
- digest=ea2a3275c807ba54

| source_path | ingested | failed | duration_ms |
|-------------|----------|--------|-------------|
| source_path=`.ai/core/` | ingested=94 | failed=0 | duration_ms=49 |
| source_path=`docs/architecture/` | ingested=5 | failed=0 | duration_ms=4 |
| source_path=`.ai/core/architecture/ADR-*.md` | ingested=7 | failed=0 | duration_ms=2 |
| source_path=`.ai/governance/releases/` | ingested=9 | failed=0 | duration_ms=3 |
| source_path=`.ai/reviews/` | ingested=39 | failed=0 | duration_ms=11 |
| source_path=`.ai/sessions/CURRENT.md` | ingested=1 | failed=0 | duration_ms=1 |

| stage | status | processed | failed | checkpoint_id | source_path |
|-------|--------|-----------|--------|---------------|-------------|
| stage=source_intake | status=completed | processed=94 | failed=0 | checkpoint_id=`cp-29c5f6987e3e3e3c` | source_path=`.ai/core/` |
| stage=normalizer | status=completed | processed=94 | failed=0 | checkpoint_id=`cp-0a7cfb52cfcc454e` | source_path=`.ai/core/` |
| stage=chunk_builder | status=completed | processed=271 | failed=0 | checkpoint_id=`cp-cfc9925b624c02b7` | source_path=`.ai/core/` |
| stage=embedding_generator | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-64a6ea0b1c3d8b17` | source_path=`.ai/core/` |
| stage=knowledge_store | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-e9474a3d470545ab` | source_path=`.ai/core/` |
| stage=index_update | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-37b586407ef2ec3c` | source_path=`.ai/core/` |
| stage=source_intake | status=completed | processed=5 | failed=0 | checkpoint_id=`cp-137632e5881d74f6` | source_path=`docs/architecture/` |
| stage=normalizer | status=completed | processed=5 | failed=0 | checkpoint_id=`cp-144a63f6a2432e87` | source_path=`docs/architecture/` |
| stage=chunk_builder | status=completed | processed=14 | failed=0 | checkpoint_id=`cp-082f37eb34815d6d` | source_path=`docs/architecture/` |
| stage=embedding_generator | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-559e087e47519f41` | source_path=`docs/architecture/` |
| stage=knowledge_store | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-eb6fc43bb1c53504` | source_path=`docs/architecture/` |
| stage=index_update | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-a754b793fbcd71b4` | source_path=`docs/architecture/` |
| stage=source_intake | status=completed | processed=7 | failed=0 | checkpoint_id=`cp-76019c429ac0da83` | source_path=`.ai/core/architecture/ADR-*.md` |
| stage=normalizer | status=completed | processed=7 | failed=0 | checkpoint_id=`cp-e7eabf1f99f98ca7` | source_path=`.ai/core/architecture/ADR-*.md` |
| stage=chunk_builder | status=completed | processed=17 | failed=0 | checkpoint_id=`cp-5e04e465b1921d3c` | source_path=`.ai/core/architecture/ADR-*.md` |
| stage=embedding_generator | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-a91088953c8097c2` | source_path=`.ai/core/architecture/ADR-*.md` |
| stage=knowledge_store | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-d2704a860f91a396` | source_path=`.ai/core/architecture/ADR-*.md` |
| stage=index_update | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-68d85f699a906d4b` | source_path=`.ai/core/architecture/ADR-*.md` |
| stage=source_intake | status=completed | processed=9 | failed=0 | checkpoint_id=`cp-f5fa49aff61a414e` | source_path=`.ai/governance/releases/` |
| stage=normalizer | status=completed | processed=9 | failed=0 | checkpoint_id=`cp-1a3aeba3904f873b` | source_path=`.ai/governance/releases/` |
| stage=chunk_builder | status=completed | processed=37 | failed=0 | checkpoint_id=`cp-59bcab5e475aec97` | source_path=`.ai/governance/releases/` |
| stage=embedding_generator | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-f6cb40e7b25b4afa` | source_path=`.ai/governance/releases/` |
| stage=knowledge_store | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-e6b132cb0dafcb3c` | source_path=`.ai/governance/releases/` |
| stage=index_update | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-a188c878cb6e39ab` | source_path=`.ai/governance/releases/` |
| stage=source_intake | status=completed | processed=39 | failed=0 | checkpoint_id=`cp-afebe8e9c4830752` | source_path=`.ai/reviews/` |
| stage=normalizer | status=completed | processed=39 | failed=0 | checkpoint_id=`cp-7d45bf84639c74e3` | source_path=`.ai/reviews/` |
| stage=chunk_builder | status=completed | processed=86 | failed=0 | checkpoint_id=`cp-646bb8fce05aa7ef` | source_path=`.ai/reviews/` |
| stage=embedding_generator | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-42fd8f78009fce14` | source_path=`.ai/reviews/` |
| stage=knowledge_store | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-d071b394743ac148` | source_path=`.ai/reviews/` |
| stage=index_update | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-66abb16a5051770d` | source_path=`.ai/reviews/` |
| stage=source_intake | status=completed | processed=1 | failed=0 | checkpoint_id=`cp-2584abb162c28c6f` | source_path=`.ai/sessions/CURRENT.md` |
| stage=normalizer | status=completed | processed=1 | failed=0 | checkpoint_id=`cp-5c6787b4b8f1cd4c` | source_path=`.ai/sessions/CURRENT.md` |
| stage=chunk_builder | status=completed | processed=6 | failed=0 | checkpoint_id=`cp-5041a09908309b68` | source_path=`.ai/sessions/CURRENT.md` |
| stage=embedding_generator | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-2aa7b98a796632c9` | source_path=`.ai/sessions/CURRENT.md` |
| stage=knowledge_store | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-96ef5a0bbb5ec234` | source_path=`.ai/sessions/CURRENT.md` |
| stage=index_update | status=skipped | processed=0 | failed=0 | checkpoint_id=`cp-7de18eecd9f19c12` | source_path=`.ai/sessions/CURRENT.md` |
