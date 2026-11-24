import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import App from '../App'
import { projects } from '../data/projects'
import { SECTIONS } from '../scene/sections'

const renderApp = () => render(<App />)

describe('estrutura da página', () => {
  test('existe uma seção para cada id, na ordem', () => {
    const { container } = renderApp()
    const ids = [...container.querySelectorAll('section[id]')].map((s) => s.id)
    expect(ids).toEqual([...SECTIONS])
  })

  test('não existe formulário na página', () => {
    const { container } = renderApp()
    expect(container.querySelector('form')).toBeNull()
  })
})

describe('início', () => {
  test('tem chamadas para projetos e LinkedIn; currículo só se existir arquivo', () => {
    renderApp()
    const hero = document.getElementById('inicio')!
    expect(within(hero).getByRole('link', { name: 'Ver projetos' })).toHaveAttribute('href', '#projetos')
    expect(within(hero).getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/marlonferreira77/')
    expect(within(hero).queryByRole('link', { name: 'Currículo (PDF)' })).toBeNull()
  })
})

describe('projetos', () => {
  test('todo projeto aparece pelo título', () => {
    renderApp()
    for (const p of projects) expect(screen.getByText(p.titulo)).toBeInTheDocument()
  })

  test('projeto interno mostra o selo e não tem links', () => {
    renderApp()
    const interno = projects.find((p) => p.tipo === 'interno')!
    const card = screen.getByText(interno.titulo).closest('[data-project]') as HTMLElement
    expect(within(card).getByText('Projeto corporativo')).toBeInTheDocument()
    expect(within(card).queryAllByRole('link')).toHaveLength(0)
  })

  test('todo cartão mostra a imagem principal do projeto', () => {
    renderApp()
    for (const p of projects) {
      const card = screen.getByText(p.titulo).closest('[data-project]') as HTMLElement
      const img = within(card).getByRole('img', { name: `Tela ilustrativa de ${p.titulo}` })
      expect(img).toHaveAttribute('src', p.imagens[0])
      expect(img).toHaveAttribute('loading', 'lazy')
    }
  })

  test('clicar num projeto o torna o projeto ativo (mostrado no monitor)', () => {
    renderApp()
    const alvo = projects[2]
    const card = screen.getByText(alvo.titulo).closest('[data-project]') as HTMLElement
    fireEvent.click(card)
    expect(card).toHaveAttribute('data-active', 'true')
  })
})

describe('contato e rodapé', () => {
  test('links de contato exatos', () => {
    renderApp()
    const contato = document.getElementById('contato')!
    const hrefs = within(contato).getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(expect.arrayContaining([
      'mailto:dev.marlonfer77@gmail.com',
      'https://www.linkedin.com/in/marlonferreira77/',
      'https://github.com/MarlonFer77',
      'https://wa.me/5521989844071',
    ]))
  })

  test('rodapé mostra o ano atual', () => {
    renderApp()
    expect(screen.getByRole('contentinfo')).toHaveTextContent(String(new Date().getFullYear()))
  })
})
