import { projects, splitProjects } from '../data/projects'
import { ProjectCard } from './ProjectCard'

export function ProjectsSection() {
  const { destaques, outros } = splitProjects(projects)
  return (
    <section id="projetos" className="section section--right">
      <div className="panel panel--wide">
        <h2>Projetos</h2>
        <p className="lead">
          Sistemas corporativos aparecem sem o nome da empresa e com telas refeitas com dados fictícios.
          Selecione um projeto para vê-lo no monitor.
        </p>
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
