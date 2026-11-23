import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { Suspense, useCallback, useRef, useState } from 'react'
import { PLACEHOLDER_POSES } from './PlaceholderRoom'
import { RoomWithFallback } from './RoomWithFallback'
import type { RoomInfo } from './Room'
import { CameraRig } from './CameraRig'
import { MonitorScreen } from './MonitorScreen'
import { sectionForObject } from './interactive'
import { sectionAt } from './sections'
import { useSectionTops } from './useSectionTops'
import { useScrollT } from './useScrollT'
import { scrollToSection } from '../ui/scrollToSection'
import type { Mesh, MeshStandardMaterial } from 'three'

/** Acende a tela do celular quando a rolagem chega em Contato. */
function PhoneGlow({ scrollT }: { scrollT: React.MutableRefObject<number> }) {
  const ref = useRef<Mesh | null>(null)
  useFrame(({ scene }) => {
    ref.current ??= scene.getObjectByName('celular_tela') as Mesh | null
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

  const onClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    const s = sectionForObject(e.object)
    if (s) { e.stopPropagation(); scrollToSection(s) }
  }, [])
  const onOver = useCallback((e: ThreeEvent<PointerEvent>) => setHover(sectionForObject(e.object) !== null), [])

  return (
    <div className="scene" style={{ cursor: hover ? 'pointer' : undefined }}>
      <Canvas dpr={dpr} camera={{ fov: 42, near: 0.05, far: 50 }} onPointerMissed={() => setHover(false)}>
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
            <MonitorScreen position={room?.monitor} />
          </Suspense>
          <CameraRig scrollT={scrollT} poses={room?.poses ?? PLACEHOLDER_POSES} />
          <PhoneGlow scrollT={scrollT} />
      </Canvas>
    </div>
  )
}
