import type { Project } from '../data/types'
import { useActiveProject } from './ActiveProjectContext'

export function ProjectCard({ project: p, compact = false }: { project: Project; compact?: boolean }) {
  const { activeId, setActiveId } = useActiveProject()
  const active = activeId === p.id
  const select = () => setActiveId(p.id)

  return (
    <article
      className={`project ${compact ? 'project--compact' : ''}`}
      data-project={p.id}
      data-active={active}
      onClick={select}
      onFocus={select}
      tabIndex={0}
      aria-current={active ? 'true' : undefined}
    >
      <header className="project__head">
        <h3 className="project__title">{p.titulo}</h3>
        <span className={`tag tag--${p.tipo}`}>{p.tipo === 'interno' ? 'Projeto corporativo' : 'Projeto pessoal'}</span>
      </header>

      {compact ? (
        <p className="project__summary">{p.solucao}</p>
      ) : (
        <dl className="project__story">
          <dt>Problema</dt><dd>{p.problema}</dd>
          <dt>Solução</dt><dd>{p.solucao}</dd>
          <dt>Resultado</dt><dd>{p.resultado}</dd>
        </dl>
      )}

      <ul className="stack" aria-label="Tecnologias">
        {p.stack.map((s) => <li key={s}>{s}</li>)}
      </ul>

      {(p.github || p.demo) && (
        <p className="project__links">
          {p.github && <a href={p.github} target="_blank" rel="noreferrer">Código no GitHub</a>}
          {p.demo && <a href={p.demo} target="_blank" rel="noreferrer">Ver demonstração</a>}
        </p>
      )}
    </article>
  )
}
