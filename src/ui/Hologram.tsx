import { useEffect, useId, useRef, useState } from 'react'
import type { Project } from '../data/types'

type Props = {
  project: Project
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  /** 'scene' = flutuando na sala (desktop); 'sheet' = painel fixo na metade de baixo (celular). */
  variant?: 'scene' | 'sheet'
}

/** Holograma clássico com os detalhes do projeto. */
export function Hologram({ project: p, onClose, onNext, onPrev, variant = 'scene' }: Props) {
  const [img, setImg] = useState(0)
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setImg(0) }, [p.id])
  useEffect(() => { closeRef.current?.focus({ preventScroll: true }) }, [p.id])

  const total = p.imagens.length
  return (
    <div className={`hologram hologram--${variant}`} role="dialog" aria-modal="true" aria-labelledby={titleId} key={p.id}>
      <div className="hologram__top">
        <h2 id={titleId} className="hologram__title">{p.titulo}</h2>
        <button ref={closeRef} type="button" className="hologram__close" onClick={onClose}>Fechar</button>
      </div>
      <span className="hologram__tag">{p.tipo === 'interno' ? 'Projeto corporativo · telas com dados fictícios' : 'Projeto pessoal'}</span>

      <div className="hologram__gallery">
        <img
          className="hologram__shot"
          src={p.imagens[img]}
          alt={`Tela ilustrativa de ${p.titulo}, imagem ${img + 1} de ${total}`}
        />
        {total > 1 && (
          <div className="hologram__thumbs">
            {p.imagens.map((src, i) => (
              <button key={src} type="button" className="hologram__thumb" aria-pressed={i === img}
                aria-label={`Ver imagem ${i + 1}`} onClick={() => setImg(i)}>
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <dl className="hologram__story">
        <dt>Problema</dt><dd>{p.problema}</dd>
        <dt>Solução</dt><dd>{p.solucao}</dd>
        <dt>Resultado</dt><dd>{p.resultado}</dd>
      </dl>

      <ul className="hologram__stack" aria-label="Tecnologias">
        {p.stack.map((s) => <li key={s}>{s}</li>)}
      </ul>

      <div className="hologram__bottom">
        <button type="button" onClick={onPrev} aria-label="Projeto anterior">‹ anterior</button>
        {p.github && <a href={p.github} target="_blank" rel="noreferrer">Código no GitHub</a>}
        {p.demo && <a href={p.demo} target="_blank" rel="noreferrer">Ver demonstração</a>}
        <button type="button" onClick={onNext} aria-label="Próximo projeto">próximo ›</button>
      </div>
    </div>
  )
}
