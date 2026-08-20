import { createClient } from 'npm:@supabase/supabase-js@^2'

let cachedKeys: { url: string; publishableKey: string; secretKey: string } | null = null
let cachedAdmin: ReturnType<typeof createClient> | null = null
let cachedOrigins: Set<string> | null = null

function keyFromJson(name: string, fallbackName: string) {
  const raw = Deno.env.get(name)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (parsed.default) return parsed.default as string
    } catch {
      // Fall through to the legacy single-value environment variable.
    }
  }
  return Deno.env.get(fallbackName) ?? ''
}

export function getSupabaseKeys() {
  if (cachedKeys) return cachedKeys
  const url = Deno.env.get('SUPABASE_URL') ?? ''
  const publishableKey = keyFromJson('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY')
  const secretKey = keyFromJson('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !publishableKey || !secretKey) throw new Error('Supabase function secrets are incomplete.')
  cachedKeys = { url, publishableKey, secretKey }
  return cachedKeys
}

export async function authenticatedUser(req: Request) {
  const authorization = req.headers.get('authorization') ?? ''
  if (!authorization.startsWith('Bearer ')) throw new Response('Unauthorized', { status: 401 })

  const { url, publishableKey } = getSupabaseKeys()
  const client = createClient(url, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) throw new Response('Unauthorized', { status: 401 })
  return data.user
}

export function adminClient() {
  if (cachedAdmin) return cachedAdmin
  const { url, secretKey } = getSupabaseKeys()
  cachedAdmin = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cachedAdmin
}

export async function enforceRateLimit(
  scope: string,
  subject: string,
  limit: number,
  windowSeconds: number,
  client = adminClient(),
) {
  const safeScope = scope.replace(/[^a-z0-9_-]/gi, '').slice(0, 60)
  const safeSubject = subject.replace(/[^a-z0-9_.:@-]/gi, '').slice(0, 100)
  const { data, error } = await client.rpc('consume_rate_limit', {
    p_bucket_key: `${safeScope}:${safeSubject}`,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  })
  if (error) throw new Error('Rate-limit service is unavailable.')
  if (data !== true) throw new Response('Too many requests', { status: 429 })
}

function allowedOrigins() {
  if (cachedOrigins) return cachedOrigins
  const configured = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  const siteUrl = Deno.env.get('SITE_URL')?.trim()
  if (siteUrl) configured.push(new URL(siteUrl).origin)
  configured.push('http://localhost:5173', 'http://127.0.0.1:5173')
  cachedOrigins = new Set(configured)
  return cachedOrigins
}

export async function readTextBody(req: Request, maxBytes: number) {
  if (!Number.isInteger(maxBytes) || maxBytes < 1) throw new Error('Invalid request size limit.')

  const declaredLength = Number(req.headers.get('content-length') ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new Response('Payload too large', { status: 413 })
  }
  if (!req.body) return ''

  const reader = req.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxBytes) {
      await reader.cancel()
      throw new Response('Payload too large', { status: 413 })
    }
    chunks.push(value)
  }

  const joined = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    joined.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(joined)
}

export async function readJsonBody(req: Request, maxBytes = 16_384) {
  const text = await readTextBody(req, maxBytes)
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    throw new Response('Invalid JSON', { status: 400 })
  }
}

export function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const allowed = allowedOrigins()
  const approvedOrigin = allowed.has(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin': approvedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, x-request-id, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Expose-Headers': 'X-Request-Id, Server-Timing',
    'Content-Type': 'application/json; charset=utf-8',
    'Vary': 'Origin',
  }
}

export function assertAllowedOrigin(req: Request) {
  const origin = req.headers.get('origin')
  if (origin && !allowedOrigins().has(origin)) throw new Response('Origin not allowed', { status: 403 })
}

export function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(req) })
}
