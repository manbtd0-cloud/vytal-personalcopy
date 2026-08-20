import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const projectRoot = new URL('..', import.meta.url).pathname
const cache = new Map()
const failures = []

async function source(path) {
  if (!cache.has(path)) cache.set(path, await readFile(join(projectRoot, path), 'utf8'))
  return cache.get(path)
}

async function expect(path, pattern, description) {
  const content = await source(path)
  if (!pattern.test(content)) failures.push(`${path}: ${description}`)
}

await expect('src/lib/storage.js', /boundedPageSize\(limit[\s\S]*\.limit\(pageSize \+ 1\)/, 'screening reads must be bounded and cursor paginated')
await expect('src/lib/patients.js', /boundedPageSize\(limit[\s\S]*\.limit\(pageSize \+ 1\)/, 'patient reads must be bounded and cursor paginated')
await expect('src/lib/patients.js', /patients!referrals_patient_owner_fk/, 'referrals and patients must load in one database request')
await expect('src/lib/patients.js', /new Map\(sessionPatients\.map/, 'demo referral joins must use O(1) patient lookups')
await expect('src/lib/account.js', /\.from\('invoices'\)[\s\S]*?\.limit\(100\)/, 'invoice history must be bounded')
await expect('src/lib/account.js', /\.from\('donations'\)[\s\S]*?\.limit\(100\)/, 'donation history must be bounded')
await expect('src/App.jsx', /lazy\(\(\) => import\('\.\/pages\//, 'application routes must be split into on-demand chunks')
await expect('src/pages/ScanPage.jsx', /import\('@mediapipe\/tasks-vision'\)/, 'MediaPipe must load only when face scanning needs it')

await expect('supabase/functions/_shared/security.ts', /let cachedAdmin/, 'warm Edge Function instances must reuse the Supabase client')
await expect('supabase/functions/_shared/security.ts', /readTextBody[\s\S]*total > maxBytes/, 'request body memory must have a hard upper bound')
await expect('supabase/functions/_shared/stripe.ts', /let cachedStripe/, 'warm Edge Function instances must reuse the Stripe client')
await expect('supabase/functions/stripe-webhook/index.ts', /const SUPPORTED_EVENT_TYPES = new Set/, 'webhook event membership checks must use a reusable Set')
await expect('supabase/functions/stripe-webhook/index.ts', /\.rpc\('apply_checkout_event'/, 'checkout validation and mutation must use one atomic RPC')
await expect('supabase/functions/stripe-webhook/index.ts', /readTextBody\(req, 524_288\)/, 'webhook payloads must have a hard size limit')

await expect('supabase/migrations/202608190005_backend_performance.sql', /screenings_reference_lookup_idx/, 'patient-reference lookup must have a matching index')
await expect('supabase/migrations/202608190005_backend_performance.sql', /referrals_owner_updated_idx/, 'ordered referral reads must have a matching index')
await expect('supabase/migrations/202608190005_backend_performance.sql', /apply_checkout_event/, 'payment state validation and update must be atomic')
await expect('supabase/migrations/202608190005_backend_performance.sql', /prune_expired_rate_limits/, 'rate-limit storage must have bounded retention support')
await expect('src/core/MemoryOutbox.js', /#drainPromise[\s\S]*return this\.#drainPromise/, 'concurrent queue flushes must use a single-flight drain')
await expect('scripts/load-test.mjs', /MAX_REQUESTS[\s\S]*MAX_CONCURRENCY[\s\S]*VYTAL_ALLOW_REMOTE_LOAD_TEST/, 'load tests must be bounded and require explicit remote authorization')
await expect('scripts/lib/performance-budget.mjs', /p95[\s\S]*p99[\s\S]*maxErrorRate/, 'load measurements must enforce latency and error-rate budgets')
await expect('supabase/tests/database/006_query_plans.sql', /explain \(costs off\)[\s\S]*screenings_owner_cursor_idx[\s\S]*api_rate_limits_updated_idx/, 'database tests must verify important query plans')

if (failures.length) {
  console.error('Performance contract check failed:\n' + failures.map((item) => `- ${item}`).join('\n'))
  process.exit(1)
}

console.log(`Performance contract check passed: ${cache.size} optimized files inspected.`)
