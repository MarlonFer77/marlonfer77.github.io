import { profile } from '../data/profile'

export function Hero() {
  return (
    <section id="inicio" className="section section--left section--hero">
      <div className="panel panel--hero">
        <h1 className="hero__name">{profile.nome}</h1>
        <p className="hero__role">{profile.cargo}</p>
        <p className="hero__pitch">
          Sistemas web em produção, do banco de dados à tela: Angular, React, Node.js, Python e Oracle.
        </p>
        <div className="hero__actions">
          <a className="btn btn--primary" href="#projetos">Ver projetos</a>
          <a className="btn" href={profile.contatos.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          {profile.curriculo && (
            <a className="btn" href={profile.curriculo} target="_blank" rel="noreferrer">Currículo (PDF)</a>
          )}
        </div>
      </div>
    </section>
  )
}
