import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const projectRoot = new URL('..', import.meta.url).pathname
const failures = []
const cache = new Map()

async function expect(path, pattern, message) {
  if (!cache.has(path)) cache.set(path, await readFile(join(projectRoot, path), 'utf8'))
  if (!pattern.test(cache.get(path))) failures.push(`${path}: ${message}`)
}

await expect('src/domain/scanning/ScanStrategy.js', /class ScanStrategy[\s\S]*FaceScanStrategy extends ScanStrategy[\s\S]*FingertipScanStrategy extends ScanStrategy/, 'scan modes must use abstraction, inheritance, and polymorphism')
await expect('src/domain/scanning/ScanStrategy.js', /class ScanStrategyFactory/, 'scan strategy creation must use a factory')
await expect('src/domain/repositories.js', /class ScreeningRepository extends Repository/, 'data access must use repository abstraction')
await expect('supabase/functions/_shared/ai-providers.ts', /abstract class AiProviderAdapter[\s\S]*class GroqProviderAdapter extends AiProviderAdapter/, 'AI providers must use the adapter pattern')
await expect('src/core/EventBus.js', /#listeners = new Map[\s\S]*subscribe[\s\S]*publish/, 'observer event bus must encapsulate subscribers')

await expect('src/core/CircularBuffer.js', /#head[\s\S]*% this\.capacity/, 'streaming data must use a circular buffer')
await expect('src/core/PriorityQueue.js', /#siftUp[\s\S]*#siftDown/, 'referral priority must use a binary heap')
await expect('src/domain/referrals/ReferralWorkflow.js', /const EDGES = new Map[\s\S]*shortestPath/, 'referral states must be represented as a graph')
await expect('src/pages/DashboardPage.jsx', /ReferralPriorityQueue/, 'dashboard triage must consume the priority queue')

await expect('supabase/functions/_shared/network.ts', /RETRYABLE_STATUS[\s\S]*2 \*\* attempt[\s\S]*AbortController/, 'outbound requests must have retry, backoff, and timeout behavior')
await expect('src/services/ClinicalRealtimeService.js', /postgres_changes[\s\S]*\.subscribe\(\)/, 'clinical updates must use realtime WebSocket subscriptions')
await expect('src/services/NetworkMonitor.js', /addEventListener\('online'[\s\S]*addEventListener\('offline'/, 'browser network state must be observed')
await expect('src/core/MemoryOutbox.js', /enqueue[\s\S]*drain\(handler\)[\s\S]*async #drain/, 'offline commands must use a bounded FIFO outbox')

await expect('src/lib/sampleTransport.js', /Float64Array/, 'worker transport must use contiguous typed memory')
await expect('src/services/SignalAnalysisService.js', /new Worker/, 'signal processing must run off the main thread')
await expect('src/services/SignalAnalysisService.js', /postMessage\([^\n]*packed\.buffer/, 'signal samples must transfer their ArrayBuffer to the worker')
await expect('src/lib/qualityFlags.js', /1 << 0[\s\S]*mask \|=/, 'quality state must use compact bit masks')

await expect('src/lib/pagination.js', /id\.lt[\s\S]*pageResult/, 'database lists must use deterministic cursor pagination')
await expect('supabase/migrations/202608190006_cs_architecture.sql', /observed_at desc, id desc[\s\S]*supabase_realtime/, 'database must index cursor paths and publish realtime tables')

if (failures.length) {
  console.error('Computer-science architecture check failed:\n' + failures.map((failure) => `- ${failure}`).join('\n'))
  process.exit(1)
}

console.log(`Computer-science architecture check passed: ${cache.size} files inspected.`)
