// Varre os arquivos versionados (e os novos ainda não ignorados) em busca de termos proibidos.
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { findBlocked } from './scan.ts'

const hashes = new Set<string>(JSON.parse(readFileSync(new URL('./blocklist.json', import.meta.url), 'utf8')))
const BINARY = /\.(png|jpe?g|webp|gif|ico|glb|gltf|bin|blend|pdf|zip|woff2?|ttf|cjs)$/i
const SKIP = /^(yarn\.lock|\.yarn\/|tools\/anon\/blocklist\.json$)/

const files = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && !BINARY.test(f) && !SKIP.test(f))

let problems = 0
for (const file of files) {
  let text: string
  try { text = readFileSync(file, 'utf8') } catch { continue }
  const hits = findBlocked(file + '\n' + text, hashes)
  if (hits.length) {
    problems++
    console.error(`✗ ${file}: ${process.env.CI ? hits.length + " termo(s) proibido(s)" : hits.join(", ")}`)
  }
}
if (problems) {
  console.error(`\n${problems} arquivo(s) citam a empresa ou sistemas internos. Corrija antes de commitar.`)
  process.exit(1)
}
console.log(`✓ anonimato ok (${files.length} arquivos verificados)`)
