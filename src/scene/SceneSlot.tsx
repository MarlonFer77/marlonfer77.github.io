import { lazy, Suspense, useMemo, type ComponentType } from 'react'
import type { Quality } from './quality'
import { RoomBoundary } from './RoomBoundary'
import { StaticRoom } from './StaticRoom'

type SceneModule = { default: ComponentType<{ dpr?: number | [number, number] }> }

const defaultLoad = () => import('./SceneCanvas')

/**
 * Lugar da cena 3D. Qualquer falha (arquivo antigo após nova publicação, WebGL que não abre,
 * textura que não carrega) cai na imagem estática — o texto da página nunca some.
 */
export function SceneSlot({ quality, load = defaultLoad }: { quality: Quality; load?: () => Promise<SceneModule> }) {
  const Scene = useMemo(() => lazy(load), [load])
  if (quality === 'static') return <StaticRoom />
  return (
    <RoomBoundary fallback={<StaticRoom />}>
      <Suspense fallback={<div className="scene scene--loading" aria-hidden="true" />}>
        <Scene dpr={quality === 'low' ? 1 : [1, 2]} />
      </Suspense>
    </RoomBoundary>
  )
}
