import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const PUBLIC_ROOT = join(process.cwd(), 'src/public')
const REACTBITS_ROOT = join(PUBLIC_ROOT, 'components/reactbits')

function sourceFiles(root) {
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(js|jsx)$/.test(name) ? [path] : []
  })
}

const prohibitedClaims = [
  /medical[- ]grade/i,
  /replaces? (a |your )?doctor/i,
  /replaces? (a |your )?cuff/i,
  /replaces? (an |your )?ecg/i,
  /diagnoses? (you|patients|disease)/i,
  /used in \d+ countries/i,
  /trusted by \d+/i,
  /saves? lives/i,
]

const unresolvedPlaceholders = [
  /\bYYYY\b/,
  /\bTBD\b/i,
  /\bTODO\b/i,
  /lorem ipsum/i,
]

test('public source contains no prohibited claim language or unresolved content placeholders', () => {
  for (const path of sourceFiles(PUBLIC_ROOT)) {
    const source = readFileSync(path, 'utf8')
    const displayPath = relative(process.cwd(), path)

    for (const pattern of prohibitedClaims) {
      expect(source, `${displayPath} matched unsupported claim ${pattern}`).not.toMatch(pattern)
    }

    for (const pattern of unresolvedPlaceholders) {
      expect(source, `${displayPath} matched unresolved placeholder ${pattern}`).not.toMatch(pattern)
    }
  }
})

test('third-party notice inventories every retained ReactBits source component', () => {
  const notice = readFileSync(join(process.cwd(), 'THIRD_PARTY_NOTICES.md'), 'utf8')
  const retainedComponents = readdirSync(REACTBITS_ROOT)
    .filter((name) => name.endsWith('.jsx'))
    .sort()

  expect(retainedComponents).toEqual([
    'ScrollReveal.jsx',
    'SplitText.jsx',
  ])

  for (const component of retainedComponents) {
    expect(notice, `${component} missing from THIRD_PARTY_NOTICES.md`).toContain(component)
  }
})
