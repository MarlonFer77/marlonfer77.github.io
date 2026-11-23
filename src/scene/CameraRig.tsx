import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type MutableRefObject } from 'react'
import { Vector3 } from 'three'
import { poseAt, type Pose, type SectionId } from './sections'
import { pointerToTilt } from './tilt'

/** Aplica a pose da rolagem à câmera, com amortecimento e leve inclinação pelo mouse. */
export function CameraRig({ scrollT, poses }: { scrollT: MutableRefObject<number>; poses: Record<SectionId, Pose> }) {
  const camera = useThree((s) => s.camera)
  const mouse = useRef({ x: 0, y: 0 })
  const pos = useRef(new Vector3())
  const target = useRef(new Vector3())
  const goalPos = useRef(new Vector3())
  const goalTarget = useRef(new Vector3())
  const first = useRef(true)

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const tilt = pointerToTilt(e, window.innerWidth, window.innerHeight)
      if (tilt) mouse.current = tilt
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useFrame((_, dt) => {
    const p = poseAt(scrollT.current, poses)
    goalPos.current.set(p.position[0] + mouse.current.x * 0.3, p.position[1] - mouse.current.y * 0.2, p.position[2])
    goalTarget.current.set(...p.target)
    const k = first.current ? 1 : 1 - Math.exp(-dt * 4)
    first.current = false
    pos.current.lerp(goalPos.current, k)
    target.current.lerp(goalTarget.current, k)
    camera.position.copy(pos.current)
    camera.lookAt(target.current)
  })

  return null
}
