import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { Suspense, useCallback, useRef, useState } from 'react'
import { PLACEHOLDER_FOCUS_POSE, PLACEHOLDER_POSES } from './PlaceholderRoom'
import { RoomWithFallback } from './RoomWithFallback'
import type { RoomInfo } from './Room'
import { CameraRig } from './CameraRig'
import { MonitorScreen } from './MonitorScreen'
import { HologramAnchor, HOLO_LIFT } from './HologramAnchor'
import { HologramFx } from './HologramFx'
import { showFx } from './showFx'
import { useQuality } from '../ui/QualityContext'
import { useStackedLayout } from '../ui/useStackedLayout'
import { interactiveName, resolveSceneClick, sectionForObject } from './interactive'
import { useFocus } from '../ui/FocusContext'
import type { SceneClick } from './interactive'
import { sectionAt } from './sections'
import { findLive } from './findLive'
import { useSectionTops } from './useSectionTops'
import { useScrollT } from './useScrollT'
import { scrollToSection } from '../ui/scrollToSection'
import type { Mesh, MeshStandardMaterial } from 'three'

/** Acende a tela do celular quando a rolagem chega em Contato. */
function PhoneGlow({ scrollT }: { scrollT: React.MutableRefObject<number> }) {
  const ref = useRef<Mesh | null>(null)
  useFrame(({ scene }) => {
    ref.current = findLive(ref.current, scene, 'celular_tela')
    const m = ref.current?.material as MeshStandardMaterial | undefined
    if (m) m.emissiveIntensity += ((sectionAt(scrollT.current) === 'contato' ? 1.2 : 0.15) - m.emissiveIntensity) * 0.1
  })
  return null
}

export default function SceneCanvas({ dpr = [1, 2] as number | [number, number] }) {
  const tops = useSectionTops()
  const scrollT = useScrollT(tops)
  const [hover, setHover] = useState(false)
  const [room, setRoom] = useState<RoomInfo | null>(null)
  const htmlLayer = useRef<HTMLDivElement>(null)
  const stacked = useStackedLayout()
  const quality = useQuality()

  const focus = useFocus()
  const act = useCallback((c: SceneClick) => {
    if (!c) return
    if (c.type === 'enter') focus.enterFocus()
    else if (c.type === 'exit') focus.exitFocus()
    else if (c.exit) focus.exitFocus(c.section)
    else scrollToSection(c.section)
  }, [focus])
  const onClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    act(resolveSceneClick(interactiveName(e.object), focus.mode))
  }, [act, focus.mode])
  const onOver = useCallback((e: ThreeEvent<PointerEvent>) => setHover(sectionForObject(e.object) !== null), [])

  return (
    <div className="scene" style={{ cursor: hover ? 'pointer' : undefined }}>
      <Canvas dpr={dpr} camera={{ fov: 42, near: 0.05, far: 50 }} onPointerMissed={() => {
        setHover(false)
        act(resolveSceneClick(null, focus.mode))
      }}>
          <color attach="background" args={['#0f1626']} />
          <fog attach="fog" args={['#0f1626', 4, 11]} />
          <ambientLight intensity={0.35} />
          <pointLight position={[0.62, 1.15, -1.1]} intensity={2.2} distance={3.5} color="#f2b35b" />
          <pointLight position={[0, 1.15, -1.0]} intensity={1.2} distance={2.5} color="#7fb2ff" />
          <directionalLight position={[3, 4, 2]} intensity={0.35} />
          <Suspense fallback={null}>
            <group onClick={onClick} onPointerOver={onOver} onPointerOut={() => setHover(false)}>
              <RoomWithFallback onReady={setRoom} />
            </group>
            <MonitorScreen position={room?.monitor} portal={htmlLayer} />
            {!stacked && <HologramAnchor monitor={room?.monitor ?? [0, 1.12, -1.29]} portal={htmlLayer} />}
            {!stacked && quality === 'full' && (
              <HologramFx monitor={room?.monitor ?? [0, 1.12, -1.29]} lift={HOLO_LIFT} visible={showFx(focus, stacked, quality)} />
            )}
          </Suspense>
          <CameraRig scrollT={scrollT} poses={room?.poses ?? PLACEHOLDER_POSES} mode={focus.mode} foco={room?.foco ?? PLACEHOLDER_FOCUS_POSE} monitor={room?.monitor ?? [0, 1.12, -1.29]} />
          <PhoneGlow scrollT={scrollT} />
      </Canvas>
      <div ref={htmlLayer} className="scene__html" />
    </div>
  )
}
