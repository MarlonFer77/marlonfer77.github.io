import { profile } from '../data/profile'

export function AboutSection() {
  return (
    <section id="sobre" className="section section--right">
      <div className="panel about">
        <img className="about__photo" src={profile.foto} alt={`Foto de ${profile.nome}`} width={112} height={112} />
        <div>
          <h2>Sobre</h2>
          <p>{profile.resumo}</p>
        </div>
      </div>
    </section>
  )
}
