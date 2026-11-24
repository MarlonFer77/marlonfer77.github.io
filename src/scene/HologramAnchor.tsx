import { Html } from '@react-three/drei'
import type { RefObject } from 'react'
import { projects } from '../data/projects'
import { useFocus } from '../ui/FocusContext'
import { Hologram } from '../ui/Hologram'
import type { Vec3 } from './sections'

/** Altura da base do holograma acima do centro da tela do monitor (m). */
export const HOLO_LIFT = 0.64

/** Holograma flutuando acima do monitor (só no desktop; no celular vira painel fixo). */
export function HologramAnchor({ monitor, portal }: { monitor: Vec3; portal: RefObject<HTMLElement | null> }) {
  const { openId, close, next, prev } = useFocus()
  const project = openId ? projects.find((p) => p.id === openId) : undefined
  if (!project) return null
  return (
    <Html
      transform
      portal={portal as RefObject<HTMLElement>}
      position={[monitor[0], monitor[1] + HOLO_LIFT, monitor[2] + 0.05]}
      distanceFactor={0.56}
      zIndexRange={[10, 10]}
      pointerEvents="auto"
    >
      <Hologram project={project} onClose={close} onNext={next} onPrev={prev} />
    </Html>
  )
}
