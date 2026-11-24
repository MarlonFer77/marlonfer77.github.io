import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { projects } from '../data/projects'
import { Hologram } from './Hologram'

const destaque = projects.find((p) => p.destaque && p.imagens.length >= 2)!
const interno = projects.find((p) => p.tipo === 'interno')!
const pessoalComLink = projects.find((p) => p.github)!
const noop = () => {}

test('é um diálogo com o nome do projeto e o foco do teclado vai para "fechar"', () => {
  render(<Hologram project={destaque} onClose={noop} onNext={noop} onPrev={noop} />)
  const dialog = screen.getByRole('dialog', { name: destaque.titulo })
  expect(dialog).toHaveAttribute('aria-modal', 'true')
  expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Fechar' }))
})

test('clicar numa miniatura troca a imagem grande', () => {
  render(<Hologram project={destaque} onClose={noop} onNext={noop} onPrev={noop} />)
  const big = screen.getByRole('img', { name: `Tela ilustrativa de ${destaque.titulo}, imagem 1 de ${destaque.imagens.length}` })
  expect(big).toHaveAttribute('src', destaque.imagens[0])
  fireEvent.click(screen.getByRole('button', { name: 'Ver imagem 2' }))
  expect(screen.getByRole('img', { name: `Tela ilustrativa de ${destaque.titulo}, imagem 2 de ${destaque.imagens.length}` }))
    .toHaveAttribute('src', destaque.imagens[1])
})

test('anterior, próximo e fechar chamam as ações', () => {
  const onNext = vi.fn(), onPrev = vi.fn(), onClose = vi.fn()
  render(<Hologram project={destaque} onClose={onClose} onNext={onNext} onPrev={onPrev} />)
  fireEvent.click(screen.getByRole('button', { name: 'Próximo projeto' }))
  fireEvent.click(screen.getByRole('button', { name: 'Projeto anterior' }))
  fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
  expect([onNext.mock.calls.length, onPrev.mock.calls.length, onClose.mock.calls.length]).toEqual([1, 1, 1])
})

test('projeto corporativo não tem links; projeto pessoal com repositório tem', () => {
  const { unmount } = render(<Hologram project={interno} onClose={noop} onNext={noop} onPrev={noop} />)
  expect(screen.queryAllByRole('link')).toHaveLength(0)
  unmount()
  render(<Hologram project={pessoalComLink} onClose={noop} onNext={noop} onPrev={noop} />)
  expect(screen.getByRole('link', { name: 'Código no GitHub' })).toHaveAttribute('href', pessoalComLink.github)
})

test('trocar de projeto volta a galeria para a primeira imagem', () => {
  const { rerender } = render(<Hologram project={destaque} onClose={noop} onNext={noop} onPrev={noop} />)
  fireEvent.click(screen.getByRole('button', { name: 'Ver imagem 2' }))
  const outro = projects.find((p) => p.id !== destaque.id && p.imagens.length >= 2)!
  rerender(<Hologram project={outro} onClose={noop} onNext={noop} onPrev={noop} />)
  expect(screen.getByRole('img', { name: new RegExp(`imagem 1 de`) })).toHaveAttribute('src', outro.imagens[0])
})
