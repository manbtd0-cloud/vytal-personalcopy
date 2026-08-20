import { readdir, readFile, stat } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const projectRoot = new URL('..', import.meta.url).pathname
const roots = ['src', 'public', 'supabase/functions']
const supported = new Set(['.js', '.jsx', '.ts', '.tsx', '.json', '.html'])
const findings = []

const forbidden = [
  { name: 'Groq API key', pattern: /gsk_[A-Za-z0-9_-]{20,}/g },
  { name: 'Stripe secret key', pattern: /sk_(?:live|test)_[A-Za-z0-9]{16,}/g },
  { name: 'Supabase secret key', pattern: /sb_secret_[A-Za-z0-9_-]{16,}/g },
  { name: 'Secret exposed through Vite', pattern: /VITE_(?:GROQ|DASHSCOPE|STRIPE_SECRET|SUPABASE_SECRET|SUPABASE_SERVICE_ROLE)[A-Z0-9_]*/g },
]

async function walk(path) {
  for (const name of await readdir(path)) {
    const target = join(path, name)
    const info = await stat(target)
    if (info.isDirectory()) await walk(target)
    else if (supported.has(extname(target))) {
      const content = await readFile(target, 'utf8')
      for (const rule of forbidden) {
        for (const match of content.matchAll(rule.pattern)) {
          findings.push(`${relative(projectRoot, target)}: ${rule.name} (${match[0].slice(0, 12)}…)`)
        }
      }
    }
  }
}

for (const root of roots) await walk(join(projectRoot, root))

const storageFile = await readFile(join(projectRoot, 'src/lib/storage.js'), 'utf8')
if (/localStorage\.(?:getItem|setItem)/.test(storageFile)) {
  findings.push('src/lib/storage.js: patient persistence must not use localStorage')
}

if (findings.length) {
  console.error('Security check failed:\n' + findings.map((item) => `- ${item}`).join('\n'))
  process.exit(1)
}

console.log('Security check passed: no browser secrets or localStorage patient persistence detected.')
