// Gera tools/anon/blocklist.json a partir de um arquivo LOCAL fora do repositório
// (padrão: ~/.portfolio-anon-terms.txt, um termo por linha, # para comentário).
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { hashTerm, tokenize } from './scan.ts'

const src = process.argv[2] ?? join(homedir(), '.portfolio-anon-terms.txt')
const terms = readFileSync(src, 'utf8')
  .split(/\r?\n/)
  .map((l) => l.replace(/#.*/, '').trim())
  .filter(Boolean)
  .map((t) => tokenize(t).join(' '))
  .filter((t) => t && t.split(' ').length <= 3)

const hashes = [...new Set(terms.map(hashTerm))].sort()
writeFileSync(new URL('./blocklist.json', import.meta.url), JSON.stringify(hashes, null, 2) + '\n')
console.log(`${hashes.length} termos gravados em tools/anon/blocklist.json`)
