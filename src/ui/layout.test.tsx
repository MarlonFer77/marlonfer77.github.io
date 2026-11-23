import { act, render } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import App from '../App'

const setWidth = (w: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w })
  window.dispatchEvent(new Event('resize'))
}

afterEach(() => setWidth(1024))

test('em tela estreita a cena fica em cima e o texto embaixo', () => {
  setWidth(375)
  render(<App />)
  expect(document.body).toHaveClass('layout--stacked')
})

test('em tela larga o texto fica sobre a cena', () => {
  setWidth(1280)
  render(<App />)
  expect(document.body).not.toHaveClass('layout--stacked')
})

test('girar a tela troca o layout', () => {
  setWidth(1280)
  render(<App />)
  act(() => setWidth(375))
  expect(document.body).toHaveClass('layout--stacked')
})

test('no celular a página reserva no topo o espaço da cena, para o título da seção não ficar escondido', () => {
  setWidth(375)
  render(<App />)
  expect(document.documentElement).toHaveClass('layout--stacked')
})
