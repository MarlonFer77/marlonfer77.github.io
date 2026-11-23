import { profile } from '../data/profile'

export function ContactSection() {
  const c = profile.contatos
  const items = [
    { label: 'E-mail', value: c.email, href: `mailto:${c.email}` },
    { label: 'LinkedIn', value: 'linkedin.com/in/marlonferreira77', href: c.linkedin },
    { label: 'GitHub', value: 'github.com/MarlonFer77', href: c.github },
    { label: 'WhatsApp', value: '(21) 98984-4071', href: c.whatsapp },
  ]
  return (
    <section id="contato" className="section section--left">
      <div className="panel">
        <h2>Contato</h2>
        <p className="lead">Procurando alguém para o seu time? Fale comigo pelo canal que preferir.</p>
        <ul className="contacts">
          {items.map((i) => (
            <li key={i.label}>
              <span className="contacts__label">{i.label}</span>
              <a href={i.href} target={i.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{i.value}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
