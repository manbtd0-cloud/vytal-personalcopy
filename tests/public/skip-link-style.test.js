import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(process.cwd(), 'src/public/styles/public-hardening.css'), 'utf8')

test('public skip link is visually hidden until keyboard focus', () => {
  expect(css).toMatch(/\.public-skip-link\s*\{[^}]*position:\s*fixed;[^}]*transform:\s*translateY\([^)]*-100%/s)
  expect(css).toMatch(/\.public-skip-link:(?:focus|focus-visible)[^{]*\{[^}]*transform:\s*translateY\(0\)/s)
})
