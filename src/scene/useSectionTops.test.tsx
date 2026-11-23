import { act, render } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import { SECTIONS } from './sections'
import { useSectionTops } from './useSectionTops'

let seen: number[] = []
function Probe() {
  seen = useSectionTops()
  return (
    <>
      {SECTIONS.map((id) => (
        <section key={id} id={id} />
      ))}
    </>
  )
}

/** Posição de cada seção na página inteira (o que importa para a rolagem). */
function mockPageTops(values: number[], scrollY = 0) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: scrollY })
  SECTIONS.forEach((id, i) => {
    document.getElementById(id)!.getBoundingClientRect = () => ({ top: values[i] - scrollY } as DOMRect)
  })
}

afterEach(() => {
  document.documentElement.style.scrollPaddingTop = ''
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
})

test('mede os topos na página e remede ao redimensionar a janela', () => {
  const { rerender } = render(<Probe />)
  mockPageTops([0, 700, 1400, 2100, 2800])
  act(() => { window.dispatchEvent(new Event('resize')) })
  rerender(<Probe />)
  expect(seen).toEqual([0, 700, 1400, 2100, 2800])

  mockPageTops([0, 900, 1800, 2700, 3600], 500)
  act(() => { window.dispatchEvent(new Event('resize')) })
  rerender(<Probe />)
  expect(seen).toEqual([0, 900, 1800, 2700, 3600])
})

test('desconta o espaço reservado no topo (cena fixa no celular), como faz o navegador ao rolar até a seção', () => {
  document.documentElement.style.scrollPaddingTop = '300px'
  render(<Probe />)
  mockPageTops([380, 1100, 1800, 2500, 3200])
  act(() => { window.dispatchEvent(new Event('resize')) })
  expect(seen).toEqual([80, 800, 1500, 2200, 2900])
})

test('nunca devolve topo negativo', () => {
  document.documentElement.style.scrollPaddingTop = '300px'
  render(<Probe />)
  mockPageTops([0, 1100, 1800, 2500, 3200])
  act(() => { window.dispatchEvent(new Event('resize')) })
  expect(seen[0]).toBe(0)
})
