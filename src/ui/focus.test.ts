import { describe, expect, test } from 'vitest'
import { focusReducer, INITIAL_FOCUS, type FocusState } from './focus'

const ids = ['a', 'b', 'c']
const run = (s: FocusState, ...actions: Parameters<typeof focusReducer>[1][]) =>
  actions.reduce((acc, a) => focusReducer(acc, a, ids), s)

describe('focusReducer', () => {
  test('entrar no foco', () => expect(run(INITIAL_FOCUS, { type: 'enter' })).toEqual({ mode: 'foco', openId: null }))

  test('abrir um projeto no foco', () => expect(run(INITIAL_FOCUS, { type: 'enter' }, { type: 'open', id: 'b' }).openId).toBe('b'))

  test('próximo no último volta ao primeiro; anterior no primeiro vai ao último', () => {
    expect(run({ mode: 'foco', openId: 'c' }, { type: 'next' }).openId).toBe('a')
    expect(run({ mode: 'foco', openId: 'a' }, { type: 'prev' }).openId).toBe('c')
  })

  test('Esc com holograma aberto fecha só o holograma', () => {
    expect(run({ mode: 'foco', openId: 'b' }, { type: 'escape' })).toEqual({ mode: 'foco', openId: null })
  })

  test('Esc sem holograma sai do foco', () => {
    expect(run({ mode: 'foco', openId: null }, { type: 'escape' })).toEqual(INITIAL_FOCUS)
  })

  test('sair limpa o projeto aberto', () => {
    expect(run({ mode: 'foco', openId: 'b' }, { type: 'exit' })).toEqual(INITIAL_FOCUS)
  })

  test('abrir projeto fora do foco entra no foco junto', () => {
    expect(run(INITIAL_FOCUS, { type: 'open', id: 'a' })).toEqual({ mode: 'foco', openId: 'a' })
  })

  test('id desconhecido não abre nada', () => {
    expect(run({ mode: 'foco', openId: null }, { type: 'open', id: 'zzz' }).openId).toBeNull()
  })
})
