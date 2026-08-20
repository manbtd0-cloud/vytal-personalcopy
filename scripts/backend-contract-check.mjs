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

await expect('supabase/migrations/202608190003_atomic_clinical_backend.sql', /security definer[\s\S]*public\.record_screening/, 'screening writes must use a protected transactional function')
await expect('supabase/migrations/202608190003_atomic_clinical_backend.sql', /public\.save_account_profile/, 'profile and baseline updates must be atomic')
await expect('supabase/migrations/202608190003_atomic_clinical_backend.sql', /revoke insert, update, delete on public\.screenings from authenticated/, 'browser screening mutations must be revoked')
await expect('src/lib/account.js', /\.rpc\('save_account_profile'/, 'client must call the atomic account profile function')
await expect('src/lib/storage.js', /\.rpc\('record_screening'/, 'client must call the atomic screening function')
await expect('src/lib/patients.js', /\.rpc\('advance_referral'/, 'client must call the validated referral transition function')

await expect('supabase/migrations/202608190004_billing_backend.sql', /create table public\.billing_products/, 'billing prices must be server-owned')
await expect('supabase/migrations/202608190004_billing_backend.sql', /public\.consume_rate_limit/, 'sensitive functions must have a backend rate limiter')
await expect('supabase/migrations/202608190004_billing_backend.sql', /public\.claim_payment_event/, 'payment events must be claimed idempotently')
await expect('supabase/functions/create-billing-checkout/index.ts', /\.from\('billing_products'\)/, 'billing checkout must load the server-defined product')
await expect('supabase/functions/create-billing-checkout/index.ts', /idempotencyKey: `vytal-invoice-/, 'invoice checkout must use a provider idempotency key')
await expect('supabase/functions/create-donation-checkout/index.ts', /payment_kind: 'donation'/, 'donation checkout must identify its signed webhook workflow')
await expect('supabase/functions/stripe-webhook/index.ts', /constructEventAsync/, 'webhook signature must be verified')
await expect('supabase/functions/stripe-webhook/index.ts', /session\.payment_status === 'paid'/, 'checkout completion must not imply payment without provider confirmation')
await expect('supabase/functions/stripe-webhook/index.ts', /\.rpc\('apply_checkout_event'/, 'webhook must validate and update checkout state atomically')
await expect('supabase/migrations/202608190005_backend_performance.sql', /checkout_session_id = p_checkout_session_id[\s\S]*amount_minor = p_amount_minor[\s\S]*currency = p_currency/, 'atomic checkout handler must match ownership, session, amount, and currency')
await expect('supabase/config.toml', /\[functions\.stripe-webhook\]\s*verify_jwt = false/, 'Stripe webhook must use provider signature verification instead of a user JWT')
await expect('supabase/config.toml', /\[functions\.create-billing-checkout\]\s*verify_jwt = true/, 'billing checkout must require a user JWT')
await expect('supabase/functions/_shared/errors.ts', /class AppError[\s\S]*createFunctionHandler/, 'Edge Functions must share centralized typed error handling')
await expect('supabase/functions/_shared/observability.ts', /class RequestTrace[\s\S]*request_id[\s\S]*Server-Timing/, 'Edge Functions must emit structured request traces')
await expect('supabase/functions/ai-explanation/index.ts', /createFunctionHandler\('ai-explanation'/, 'AI errors must use the centralized function handler')
await expect('supabase/functions/stripe-webhook/index.ts', /createFunctionHandler\('stripe-webhook'/, 'webhook errors must use the centralized function handler')

if (failures.length) {
  console.error('Backend contract check failed:\n' + failures.map((item) => `- ${item}`).join('\n'))
  process.exit(1)
}

console.log(`Backend contract check passed: ${cache.size} protected backend files inspected.`)
