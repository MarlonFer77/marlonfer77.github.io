import { createHash } from 'node:crypto'
import { expect, test } from 'vitest'
import { findBlocked } from './scan'

const h = new Set(['acme corp', 'intranet x'].map((t) => createHash('sha256').update(t).digest('hex')))

test('acha termo proibido ignorando maiúsculas e pontuação', () => {
  expect(findBlocked('Feito para a ACME Corp.', h)).toEqual(['acme corp'])
})

test('texto neutro não acusa nada', () => {
  expect(findBlocked('Portal de RH', h)).toEqual([])
})

test('ignora acentos e espaços repetidos', () => {
  expect(findBlocked('acmé  corp', h)).toEqual(['acme corp'])
})
