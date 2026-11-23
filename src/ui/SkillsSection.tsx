import { skills } from '../data/skills'

export function SkillsSection() {
  return (
    <section id="habilidades" className="section section--left">
      <div className="panel">
        <h2>Habilidades</h2>
        <p className="lead">Cada cor é um volume da estante.</p>
        <div className="skills">
          {skills.map((g) => (
            <div key={g.grupo} className="skill" style={{ '--c': g.cor } as React.CSSProperties}>
              <h3 className="skill__name">{g.grupo}</h3>
              <ul className="stack">{g.itens.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
