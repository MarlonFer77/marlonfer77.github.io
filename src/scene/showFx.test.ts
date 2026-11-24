import { expect, test } from 'vitest'
import { showFx } from './showFx'

const aberto = { mode: 'foco' as const, openId: 'x' }

test('efeitos só com holograma aberto, no desktop e em qualidade total', () => {
  expect(showFx(aberto, false, 'full')).toBe(true)
})
test('celular não tem efeitos (o holograma é um painel fixo)', () => expect(showFx(aberto, true, 'full')).toBe(false))
test('aparelho fraco não tem efeitos', () => expect(showFx(aberto, false, 'low')).toBe(false))
test('holograma fechado não tem efeitos', () => expect(showFx({ mode: 'foco', openId: null }, false, 'full')).toBe(false))
