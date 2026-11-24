import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { FocusProvider, useFocus } from './FocusContext'

let api: ReturnType<typeof useFocus>
function Probe() {
  api = useFocus()
  return (
    <>
      <button id="explorar">Explorar no computador</button>
      <button id="icone">Ícone</button>
      <section id="sobre" />
    </>
  )
}

/** Simula o navegador terminando a navegação pedida por history.back()/go(). */
const browserPops = () => act(() => { window.dispatchEvent(new PopStateEvent('popstate')) })

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 1234 })
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  Element.prototype.scrollIntoView = vi.fn()
  vi.spyOn(history, 'pushState')
  vi.spyOn(history, 'replaceState')
  vi.spyOn(history, 'back').mockImplementation(() => {})
  vi.spyOn(history, 'go').mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

const setup = () => render(<FocusProvider><Probe /></FocusProvider>)

test('entrar e sair do foco devolve a página à mesma posição, destrava a rolagem e devolve o foco do teclado', () => {
  setup()
  ;(document.getElementById('explorar') as HTMLButtonElement).focus()
  act(() => api.enterFocus())
  expect(document.documentElement).toHaveClass('is-focus')
  expect(history.pushState).toHaveBeenCalledTimes(1)
  ;(document.body as HTMLElement).focus()
  act(() => api.exitFocus())
  expect(document.documentElement).not.toHaveClass('is-focus')
  expect(history.go).toHaveBeenCalledWith(-1)
  browserPops()
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 1234, behavior: 'instant' })
  expect(document.activeElement?.id).toBe('explorar')
})

test('Esc fecha primeiro o holograma e depois sai do foco', () => {
  setup()
  act(() => { api.enterFocus() })
  act(() => { api.open('people-analytics') })
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(api.openId).toBeNull()
  expect(api.mode).toBe('foco')
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(api.mode).toBe('scroll')
})

test('Voltar do navegador sem holograma sai do foco sem voltar o histórico de novo', () => {
  setup()
  act(() => api.enterFocus())
  browserPops()
  expect(api.mode).toBe('scroll')
  expect(history.go).not.toHaveBeenCalled()
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 1234, behavior: 'instant' })
})

test('Voltar do navegador com holograma aberto fecha só o holograma', () => {
  setup()
  act(() => api.enterFocus())
  act(() => api.open('people-analytics'))
  expect(history.pushState).toHaveBeenCalledTimes(2)
  browserPops()
  expect(api.openId).toBeNull()
  expect(api.mode).toBe('foco')
})

test('fechar o holograma pelo site desfaz a entrada dele no histórico e devolve o foco ao ícone', () => {
  setup()
  act(() => api.enterFocus())
  const icone = document.getElementById('icone') as HTMLButtonElement
  icone.focus()
  act(() => api.open('people-analytics'))
  ;(document.body as HTMLElement).focus()
  act(() => api.close())
  expect(history.back).toHaveBeenCalledTimes(1)
  browserPops()
  expect(api.mode).toBe('foco')
  expect(document.activeElement).toBe(icone)
})

test('sair do foco com holograma aberto volta as duas entradas do histórico', () => {
  setup()
  act(() => api.enterFocus())
  act(() => api.open('people-analytics'))
  act(() => api.exitFocus())
  expect(history.go).toHaveBeenCalledWith(-2)
})

test('clicar num objeto durante o foco sai e vai para a seção dele, não para a posição antiga', () => {
  setup()
  act(() => api.enterFocus())
  act(() => api.exitFocus('sobre'))
  browserPops()
  expect(document.getElementById('sobre')!.scrollIntoView).toHaveBeenCalled()
  expect(window.scrollTo).not.toHaveBeenCalled()
})
