import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import { Vector3 } from 'three'
import { readPoses } from './readPoses'
import { toUnlit } from './bakedMaterials'
import type { Pose, SectionId, Vec3 } from './sections'

export const ROOM_URL = 'models/sala.glb'

export type RoomInfo = { poses: Record<SectionId, Pose>; monitor: Vec3 }

/** Sala modelada no Blender. Lê poses de câmera e posição do monitor do próprio GLB. */
export function Room({ onReady }: { onReady: (info: RoomInfo) => void }) {
  const { scene } = useGLTF(ROOM_URL, false)

  useEffect(() => {
    toUnlit(scene)
    const poses = readPoses(scene)
    const m = scene.getObjectByName('monitor_tela')!.getWorldPosition(new Vector3())
    onReady({ poses, monitor: [m.x, m.y, m.z + 0.006] })
  }, [scene, onReady])

  return <primitive object={scene} />
}
