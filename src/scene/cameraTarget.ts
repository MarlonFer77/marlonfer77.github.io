import { poseAt, type Pose, type SectionId } from './sections'

/** Pose que a câmera persegue: no foco, a pose fixa de frente para o monitor; senão, a da rolagem. */
export function cameraTarget(mode: 'scroll' | 'foco', scrollT: number, poses: Record<SectionId, Pose>, foco: Pose): Pose {
  return mode === 'foco' ? foco : poseAt(scrollT, poses)
}
