import { projects, splitProjects } from '../data/projects'
import { ProjectCard } from './ProjectCard'
import { useFocus } from './FocusContext'
import { useQuality } from './QualityContext'

export function ProjectsSection() {
  const { destaques, outros } = splitProjects(projects)
  const { enterFocus } = useFocus()
  const quality = useQuality()
  return (
    <section id="projetos" className="section section--right">
      <div className="panel panel--wide">
        <h2>Projetos</h2>
        <p className="lead">
          Sistemas corporativos aparecem sem o nome da empresa e com telas refeitas com dados fictícios.
          Selecione um projeto para vê-lo no monitor.
        </p>
        {quality !== 'static' && (
          <button type="button" className="btn btn--holo" onClick={enterFocus}>Explorar no computador</button>
        )}
        <div className="projects">
          {destaques.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
        <h3 className="subhead">Outros projetos</h3>
        <div className="projects projects--compact">
          {outros.map((p) => <ProjectCard key={p.id} project={p} compact />)}
        </div>
      </div>
    </section>
  )
}
