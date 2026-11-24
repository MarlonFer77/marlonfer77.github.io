import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { SceneSlot } from './SceneSlot'

test('se o carregamento da cena falhar (ex.: arquivo antigo após nova publicação), mostra a imagem estática', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  const { container } = render(<SceneSlot quality="full" load={() => Promise.reject(new Error('chunk 404'))} />)
  await screen.findByTestId('static-room')
  expect(container.querySelector('img')).toHaveAttribute('src', 'img/sala-estatica.webp')
})

test('qualidade estática mostra a imagem sem tentar carregar a cena', () => {
  const load = vi.fn()
  render(<SceneSlot quality="static" load={load} />)
  expect(screen.getByTestId('static-room')).toBeInTheDocument()
  expect(load).not.toHaveBeenCalled()
})
