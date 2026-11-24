import { Vector3, type Object3D } from 'three'
import { SECTIONS, type Pose, type SectionId, type Vec3 } from './sections'

const world = (o: Object3D): Vec3 => {
  const v = o.getWorldPosition(new Vector3())
  return [v.x, v.y, v.z]
}

/** Lê os empties cam_<secao> e alvo_<secao> da cena (posição no mundo). */
export function readPoses(root: Object3D): Record<SectionId, Pose> {
  root.updateWorldMatrix(true, true)
  const missing: string[] = []
  const poses = {} as Record<SectionId, Pose>
  for (const id of SECTIONS) {
    const cam = root.getObjectByName(`cam_${id}`)
    const alvo = root.getObjectByName(`alvo_${id}`)
    if (!cam) missing.push(`cam_${id}`)
    if (!alvo) missing.push(`alvo_${id}`)
    if (cam && alvo) poses[id] = { position: world(cam), target: world(alvo) }
  }
  if (missing.length) throw new Error(`Cena sem os objetos de câmera: ${missing.join(', ')}`)
  return poses
}

/** Pose do modo foco: empties cam_foco e alvo_foco. */
export function readFocusPose(root: Object3D): Pose {
  root.updateWorldMatrix(true, true)
  const cam = root.getObjectByName('cam_foco')
  const alvo = root.getObjectByName('alvo_foco')
  const missing = [!cam && 'cam_foco', !alvo && 'alvo_foco'].filter(Boolean)
  if (missing.length) throw new Error(`Cena sem os objetos de câmera: ${missing.join(', ')}`)
  return { position: world(cam!), target: world(alvo!) }
}
