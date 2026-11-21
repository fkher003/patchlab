# Changelog

## 0.2.0 — 2026-11-20

### Added

- **External report schema v3** for both `refund` and `lock-store` contracts, exporting `failure.json`, static `report.html`, and executable `repro.test.ts` per run.
- **Explicit-target replay (`replay-external`)** with metadata validation and entry-file SHA-256 verification before `import()`, plus `--allow-changed` for comparing fixed implementations.
- **One-command showcase (`npm run showcase`)** reproducing `paveg/hono-idempotency #89` end-to-end (detect, shrink `30 -> 4`, replay parent/fixed, execute exported regression test).
- **Benchmark timing (`benchmark --timing`)** separating check and shrink durations alongside Node/OS environment details while preserving deterministic failure counts.
- **Static HTML evidence sample** (`docs/evidence/case001-report.html`) displaying contract configuration and observed failure details.
- **MIT `LICENSE`** and English public-facing documentation.

### Hardened

- Adapter factory validation at load time (`loadAdapter` / `loadStoreAdapter`) so malformed objects return exit code `2` instead of being misclassified as runtime failures.
- Strict `Number.isSafeInteger` validation for `service.total()` and non-primitive response checks in `src/checker.ts`.
- Rejection of empty operation/request arrays in `replay` and `replay-external` (exit code `2`) to prevent false-positive `PASS` results.
- Strict CLI argument validation for numeric flags (`seed`, `n`) and unexpected extra arguments.

### Known Limitations

- External adapters run with user permissions (no sandbox or per-operation timeout yet).
- Provenance hashing covers the adapter entry file only, not transitive dependencies.
- Concurrency, TTL expiration, crash recovery, and real database backends are out of scope for v0.2.0.
