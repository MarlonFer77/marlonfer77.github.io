import type { MouseEvent } from 'react'
import type { SectionId } from '../scene/sections'
import { scrollToSection } from './scrollToSection'

const LINKS: { id: SectionId; label: string }[] = [
  { id: 'projetos', label: 'Projetos' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'sobre', label: 'Sobre' },
  { id: 'contato', label: 'Contato' },
]

export function Nav() {
  const go = (id: SectionId) => (e: MouseEvent) => {
    e.preventDefault()
    scrollToSection(id)
  }
  return (
    <header className="nav">
      <a className="nav__brand" href="#inicio" onClick={go('inicio')}>Marlon Ferreira</a>
      <nav aria-label="Seções">
        <ul className="nav__links">
          {LINKS.map((l) => (
            <li key={l.id}><a href={`#${l.id}`} onClick={go(l.id)}>{l.label}</a></li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
