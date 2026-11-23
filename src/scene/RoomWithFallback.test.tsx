import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { RoomBoundary } from './RoomWithFallback'

function Broken(): never {
  throw new Error('GLB não encontrado (404)')
}

test('se o GLB falhar, a sala provisória continua na tela', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  render(
    <RoomBoundary fallback={<div data-testid="placeholder-room" />}>
      <Broken />
    </RoomBoundary>,
  )
  expect(screen.getByTestId('placeholder-room')).toBeInTheDocument()
})

test('sem erro, mostra o modelo final', () => {
  render(
    <RoomBoundary fallback={<div data-testid="placeholder-room" />}>
      <div data-testid="sala-final" />
    </RoomBoundary>,
  )
  expect(screen.getByTestId('sala-final')).toBeInTheDocument()
  expect(screen.queryByTestId('placeholder-room')).toBeNull()
})
