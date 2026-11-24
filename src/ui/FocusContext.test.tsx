import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { FocusProvider, useFocus } from './FocusContext'

let api: ReturnType<typeof useFocus>
function Probe() {
  api = useFocus()
  return null
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 1234 })
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  vi.spyOn(history, 'pushState')
  vi.spyOn(history, 'back').mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

test('entrar e sair do foco devolve a página à mesma posição e destrava a rolagem', () => {
  render(<FocusProvider><Probe /></FocusProvider>)
  act(() => api.enterFocus())
  expect(document.documentElement).toHaveClass('is-focus')
  expect(history.pushState).toHaveBeenCalled()
  act(() => api.exitFocus())
  expect(document.documentElement).not.toHaveClass('is-focus')
  expect(window.scrollTo).toHaveBeenCalledWith(0, 1234)
  expect(history.back).toHaveBeenCalled()
})

test('Esc fecha primeiro o holograma e depois sai do foco', () => {
  render(<FocusProvider><Probe /></FocusProvider>)
  act(() => { api.enterFocus(); api.open('people-analytics') })
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(api.openId).toBeNull()
  expect(api.mode).toBe('foco')
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(api.mode).toBe('scroll')
})

test('botão Voltar do navegador sai do foco sem voltar o histórico de novo', () => {
  render(<FocusProvider><Probe /></FocusProvider>)
  act(() => api.enterFocus())
  act(() => { window.dispatchEvent(new PopStateEvent('popstate')) })
  expect(api.mode).toBe('scroll')
  expect(history.back).not.toHaveBeenCalled()
  expect(window.scrollTo).toHaveBeenCalledWith(0, 1234)
})
