import { Html } from '@react-three/drei'
import type { RefObject } from 'react'
import { projects } from '../data/projects'
import { useActiveProject } from '../ui/ActiveProjectContext'
import { useFocus } from '../ui/FocusContext'

const shortTitle = (t: string) => t.split(':')[0]

/**
 * Tela do monitor como "área de trabalho": um ícone por projeto.
 * Na rolagem é só visual (o clique no monitor entra no foco); no foco os ícones abrem o holograma.
 */
export function MonitorScreen({ position = [0, 1.12, -1.29], portal }: {
  position?: [number, number, number]
  /** Camada HTML fixa sobre o canvas: evita que o <Html> recrie a raiz e perca o conteúdo. */
  portal?: RefObject<HTMLElement | null>
}) {
  const { activeId } = useActiveProject()
  const { mode, openId, open } = useFocus()
  const interactive = mode === 'foco'
  return (
    <Html transform portal={portal as RefObject<HTMLElement>} position={position} distanceFactor={0.5} pointerEvents={interactive ? 'auto' : 'none'} zIndexRange={[0, 0]}>
      <div className={`desktop ${interactive ? 'desktop--live' : ''}`} aria-hidden={!interactive}>
        {projects.map((p) => (
          <button
            key={p.id}
            type="button"
            className="desktop__icon"
            data-on={p.id === (openId ?? activeId)}
            tabIndex={interactive ? 0 : -1}
            onClick={() => open(p.id)}
            aria-label={`Abrir ${p.titulo}`}
          >
            <img src={p.imagens[0]} alt="" loading="lazy" />
            <span>{shortTitle(p.titulo)}</span>
          </button>
        ))}
      </div>
    </Html>
  )
}
