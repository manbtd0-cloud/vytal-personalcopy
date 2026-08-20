# VYTAL backend performance and complexity

This pass optimizes the backend access paths that can affect real users. It does not add complicated
algorithms for appearance: each change either removes network work, bounds memory, or gives Postgres
an index that matches an application query.

## What changed

| Path | Before | Optimized design | Time / space effect |
|---|---|---|---|
| Referral list | One referral request, one patient request, then a client `Set` and `Map` join | One PostgREST relationship query | One network round trip; output remains O(r) |
| Patient, referral, screening, invoice and donation lists | Some lists could grow without a response bound | Explicit newest-first limits | O(k) response time and O(k) client memory, where `k` is the configured limit |
| Screening by patient reference | Filter and sort without an exact composite index | `(user_id, patient_reference, observed_at desc)` index | Indexed lookup is normally O(log n), instead of an O(n) scan |
| Referral history | Owner filter and updated-time sort lacked an exact index | `(user_id, updated_at desc)` index | Normally O(log n + k) for the first page |
| Webhook payment update | Read row, validate in JavaScript, update row | One `apply_checkout_event` database RPC validates and updates atomically | Removes a database round trip and the read/write race window |
| Edge Function setup | Clients and configuration rebuilt per request | Module-level Supabase, Stripe, crypto and origin caches | O(1) reuse on warm isolates and fewer allocations |
| Request bodies | `req.json()` / `req.text()` had no application-level maximum | Streaming byte counter with 4 KiB JSON and 512 KiB webhook caps | O(B) time and O(B) memory with a hard maximum |
| Webhook event matching | A `Set` was allocated inside every request | One module-level `Set` | Average O(1) membership with no per-request collection allocation |
| Rate-limit storage | Old buckets had no indexed cleanup path | Indexed timestamp plus service-only prune function | O(log n) cutoff access plus O(d) deletion work |
| Browser startup | All routes and MediaPipe were loaded eagerly | Lazy route chunks; MediaPipe loads only when face scanning begins | Smaller initial transfer and no vision allocation for non-scan sessions |
| Concurrent offline flushes | Two callers could drain the same command before either advanced the queue | Single-flight drain promise shared by concurrent callers | Each command executes once while a flush is in flight |
| Edge Function diagnosis | Free-form errors without a stable request correlation key | Structured JSON events, request IDs and `Server-Timing` | O(1) trace metadata with safer failure diagnosis |
| Performance measurement | Optimizations had no repeatable API budget gate | Bounded concurrent load harness with p95/p99/error budgets | O(q) measurements and O(c) active requests, both hard-capped |
| Query-plan regression | Index existence was checked without confirming planner use | Deterministic pgTAP `EXPLAIN` assertions for seven access paths | Detects index-plan regressions during database CI |

`n` is the table size, `k` is the bounded page size, `r` is returned referrals, `B` is accepted body
bytes, and `d` is the number of expired rows removed.

## DSA principles used

- **Hash map:** demo referrals build one patient `Map`, changing repeated patient search from O(r × p)
  to O(p + r).
- **Hash set:** webhook event-type membership is average O(1) and the set is reused.
- **Bounded collections:** every high-growth UI list has an explicit maximum, preventing memory use
  from scaling with the full database.
- **Composite and partial indexes:** index column order follows equality filters first and sort/range
  fields second. The active-referral partial index excludes completed/cancelled rows.
- **Single-pass transforms:** vital observations are converted with one `for...of` pass into a
  null-prototype lookup object.
- **Atomic state transition:** checkout validation and mutation happen in one transactionally safe
  database function, preserving correctness under duplicate or concurrent provider events.
- **Idempotency:** provider idempotency keys and the payment-event claim table prevent duplicate work.

## Request tracing and centralized errors

Every Edge Function now uses the shared `RequestTrace` and `createFunctionHandler` boundary. Responses
carry `X-Request-Id`, `Server-Timing`, and `Cache-Control: no-store`. Logs are one-line JSON containing
the function, event, status, duration and stable error code. Request bodies, authorization headers,
patient values, payment metadata and provider secrets are never written to these log events.

Public failures use a stable `{ error: { code, message, requestId, retryable } }` shape. Internal
exceptions are converted at one boundary, preventing database/provider details from leaking to clients.

## Load testing and budgets

Budgets live in `config/performance-budgets.json`. The harness caps a run at 5,000 requests and 100
concurrent workers. It refuses remote targets unless the operator explicitly sets
`VYTAL_ALLOW_REMOTE_LOAD_TEST=1`, preventing accidental load against an unapproved system.

Example against an authorized local endpoint on Windows PowerShell:

```powershell
$env:VYTAL_LOAD_TARGET="http://127.0.0.1:54321/functions/v1/ai-explanation"
$env:VYTAL_LOAD_PROFILE="externalProvider"
$env:VYTAL_LOAD_REQUESTS="100"
$env:VYTAL_LOAD_CONCURRENCY="10"
$env:VYTAL_LOAD_BODY='{"hr":72,"br":16,"stress":25,"langCode":"en"}'
npm.cmd run performance:load
```

Use only synthetic data and an authorized test token for protected endpoints. Timings are reported as
p50, p95, p99, maximum, throughput, status counts and error rate. The command exits non-zero when a
budget is exceeded, making the same harness suitable for a controlled performance pipeline later.

## Query-plan analysis

`supabase/tests/database/006_query_plans.sql` disables sequential scans only inside its rolled-back test
transaction, runs `EXPLAIN (costs off)`, and verifies that screening, patient, referral, invoice,
donation, patient-reference and rate-limit cleanup paths select their intended indexes. This is a
deterministic structural gate; representative staging data should still be measured with
`EXPLAIN (ANALYZE, BUFFERS)` before making real latency claims.

## Integration and concurrency tests

`npm run test:integration` exercises actual concurrent HTTP requests through a loopback server,
validates unique request correlation IDs, tests performance-budget failures, and proves that concurrent
outbox flush calls share one in-flight operation rather than processing commands twice.

## Operational tasks

When deployment is in scope, apply all migrations in filename order and deploy all Edge Functions again.
From a trusted scheduled server job (never the browser), call `prune_expired_rate_limits()` daily with
the service role. The default removes rate-limit buckets older than two days.

Run the local contracts and build:

```bash
npm run performance:check
npm run test:integration
npm run verify
```

With local Supabase running, test the indexes and atomic payment function:

```bash
supabase test db
```

For production measurement, enable Supabase query performance monitoring, inspect slow queries with
`EXPLAIN (ANALYZE, BUFFERS)` on representative non-production data, and measure p50/p95/p99 API
latency. Structural complexity is not a substitute for workload measurements.

## Cursor pagination

Older screening history now loads through deterministic `(observed_at, id)` keyset cursors. Matching
owner/timestamp/id indexes keep page work stable as the table grows; the UUID breaks timestamp ties.
Patients and referrals expose the same repository pagination contract for future list controls.
