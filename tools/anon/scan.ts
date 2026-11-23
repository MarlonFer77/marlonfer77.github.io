import { createHash } from 'node:crypto'

/** Minúsculas, sem acentos, só letras e números; devolve as palavras. */
export function tokenize(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

export function hashTerm(term: string): string {
  return createHash('sha256').update(term).digest('hex')
}

/** Trechos de 1 a 3 palavras consecutivas cujo hash está na lista. */
export function findBlocked(text: string, hashes: Set<string>): string[] {
  const words = tokenize(text)
  const found = new Set<string>()
  for (let i = 0; i < words.length; i++) {
    for (let n = 1; n <= 3 && i + n <= words.length; n++) {
      const gram = words.slice(i, i + n).join(' ')
      if (hashes.has(hashTerm(gram))) found.add(gram)
    }
  }
  return [...found]
}
