# VYTAL computer-science architecture

VYTAL uses computer-science concepts where they improve correctness, performance, or extensibility.
This document maps each academic concept to production code and explains the associated complexity.

## System flow

```text
Camera -> Scan Strategy -> Circular Buffers -> Float64Array transfer -> Web Worker
       -> rPPG analysis -> Clinical Risk Policy -> Screening Repository
       -> PostgreSQL transaction -> Referral Graph -> Priority Queue -> Realtime dashboard
```

## 1. Object-oriented programming

| Concept | Implementation | Purpose |
|---|---|---|
| Encapsulation | Private `#storage`, `#heap`, `#listeners`, and service state | Prevent callers from corrupting internal invariants |
| Abstraction | Abstract `Repository`, `ScanStrategy`, and `AiProviderAdapter` boundaries | Expose responsibilities rather than implementation details |
| Inheritance | Face/fingertip strategies and Groq/DashScope adapters extend base classes | Share contracts while specializing behavior |
| Polymorphism | Scanner and AI code call the same methods on different implementations | Remove provider/mode-specific branching from orchestration |
| Factory | `ScanStrategyFactory` and `AiProviderFactory` | Centralize safe runtime implementation selection |
| Strategy | Face and fingertip camera constraints/contact behavior | Make scan modes independently replaceable and testable |
| Observer | `EventBus`, `NetworkMonitor`, and Realtime subscriptions | Decouple event producers from dashboard consumers |
| Repository | Screening, patient, and referral repositories | Keep UI components independent from Supabase/demo persistence |
| Adapter | OpenAI-compatible provider adapters | Normalize Groq and DashScope behind one interface |

SOLID application:

- **Single responsibility:** structures, clinical policy, transport, persistence, and UI are separate.
- **Open/closed:** a new scan mode or AI provider can extend a contract without rewriting consumers.
- **Liskov substitution:** every scan/provider subclass supports its base-class behavior.
- **Interface segregation:** repositories expose entity-specific methods instead of one oversized service.
- **Dependency inversion:** pages depend on repository/strategy abstractions, not database queries.

## 2. Data structures and algorithms

| Structure/algorithm | Use | Complexity |
|---|---|---|
| Circular buffer | Bounded RGB and brightness streams | push O(1), indexed access O(1), export O(n), space O(k) |
| Binary min-heap | Urgent referral triage by priority/due time | insert O(log n), peek O(1), remove O(log n) |
| FIFO outbox queue | Ordered offline referral commands | enqueue O(1), drain O(n), bounded space O(k) |
| Directed graph | Legal referral workflow transitions | direct transition O(1), shortest path O(V + E) |
| Hash map/set | Patient joins, event listeners, visited graph states | average lookup/add O(1) |
| Single-pass reduction | Dashboard screening statistics | O(n) rather than several O(n) passes |
| Keyset search | Older database pages | normally O(log n + k) with a matching B-tree index |

The benchmark is descriptive and never acts as a flaky deployment gate:

```bash
npm run benchmark:dsa
```

## 3. Computer networks

- HTTP Edge Functions enforce methods, bounded JSON, status codes, CORS origins, and JWT identity.
- HTTPS/TLS is terminated by Supabase/hosting and provider endpoints use HTTPS only.
- AI provider calls have a 15-second timeout, bounded attempts, exponential backoff, jitter, and a
  retryable-status `Set`.
- Payment retries rely on Stripe idempotency keys and signed webhook event claims rather than unsafe
  client retries.
- Supabase Realtime uses a WebSocket channel for screening inserts and referral changes; RLS still
  controls which rows a signed-in account receives.
- `NetworkMonitor` applies the Observer pattern to browser online/offline events. Protected health
  information is not placed in `localStorage` as an offline shortcut. Referral transition commands
  can use a bounded, memory-only FIFO outbox and are replayed sequentially after reconnection.
- Rate limiting, request size limits, and strict origin validation protect network boundaries.

## 4. Computer organization and assembly-language concepts

- Camera streams use fixed-capacity buffers, demonstrating bounded memory rather than unbounded heap growth.
- Samples cross the worker boundary as a contiguous `Float64Array` with a four-value record layout
  (`t`, `r`, `g`, `b`). Its `ArrayBuffer` is transferred, not copied.
- rPPG computation runs in a Web Worker, separating the UI/main thread from CPU-intensive signal work.
- Camera-quality conditions use a bitmask (`1 << n`, bitwise OR/AND), storing five boolean states in
  one integer that can also be persisted in screening metadata.
- Float64 arithmetic makes IEEE-754 behavior explicit for signal samples.
- MediaPipe/WASM assets are dynamically loaded only for face scanning. The VYTAL-owned rPPG worker
  remains JavaScript so the medically relevant algorithm stays readable and testable; a native/WASM
  spectrum engine can later implement the same worker interface after device benchmarking.

## 5. Database systems

- Schema normalization separates profiles, patients, screenings, observations, referrals, events,
  billing products, invoices, donations, and provider events.
- Primary, unique, foreign, check, and composite-owner constraints enforce integrity in PostgreSQL.
- RLS plus forced RLS enforces tenant isolation independently of frontend code.
- `record_screening`, `advance_referral`, `save_account_profile`, and `apply_checkout_event` provide
  ACID state transitions and close read/write race windows.
- Append-only referral/audit events preserve traceability.
- Composite B-tree indexes follow equality-owner columns, descending cursor timestamps, and descending
  UUID tie-breakers.
- Keyset pagination uses `(timestamp, id)` rather than high-cost offsets, keeping page cost stable.
- pgTAP tests verify RLS, transactions, payment integrity, indexes, and Realtime publication.

## 6. Verification evidence

```bash
npm run cs:check
npm run test:unit
npm run performance:check
npm run verify
supabase test db
```

The unit suite tests ring overwrite order, heap ordering, observer lifecycle, strategy polymorphism,
workflow graph traversal, clinical policy, TypedArray transport, bit flags, and cursor construction.
The static architecture contract prevents key concepts from silently disappearing during refactors.

## Honest limitations

- This is a screening and decision-support prototype, not a certified diagnostic device.
- Big-O analysis describes growth, not actual production latency. Use realistic data with
  `EXPLAIN (ANALYZE, BUFFERS)` and p50/p95/p99 monitoring before claiming measured improvements.
- Realtime depends on the Supabase project enabling the migration publication and maintaining a network.
- WebAssembly should only replace the readable signal engine if representative device benchmarks show
  a real gain without changing numerical accuracy.
