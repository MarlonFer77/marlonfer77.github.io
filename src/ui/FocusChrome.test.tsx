import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AppProviders, AppShell } from '../App'
import { useFocus } from './FocusContext'

let api: ReturnType<typeof useFocus>
function Probe() {
  api = useFocus()
  return null
}

const setWidth = (w: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w })
  window.dispatchEvent(new Event('resize'))
}

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  vi.spyOn(history, 'back').mockImplementation(() => {})
})
afterEach(() => { vi.restoreAllMocks(); setWidth(1024) })

const renderShell = () => render(<AppProviders quality="full"><AppShell /><Probe /></AppProviders>)

test('no foco, o texto da página fica inerte e aparece o botão Voltar', () => {
  setWidth(1280)
  const { container } = renderShell()
  act(() => api.enterFocus())
  for (const sel of ['main', 'header.nav', 'footer']) expect(container.querySelector(sel)).toHaveAttribute('inert')
  fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))
  expect(api.mode).toBe('scroll')
  expect(container.querySelector('main')).not.toHaveAttribute('inert')
})

test('no celular, o holograma abre como painel fixo fora do 3D', () => {
  setWidth(375)
  const { container } = renderShell()
  act(() => api.open('people-analytics'))
  expect(container.querySelector('.hologram--sheet')).not.toBeNull()
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})

test('no desktop, o painel fixo não aparece (o holograma fica na cena 3D)', () => {
  setWidth(1280)
  const { container } = renderShell()
  act(() => api.open('people-analytics'))
  expect(container.querySelector('.hologram--sheet')).toBeNull()
})
