import { poseAt, type Pose, type SectionId } from './sections'

/** Pose que a câmera persegue: no foco, a pose fixa de frente para o monitor; senão, a da rolagem. */
export function cameraTarget(mode: 'scroll' | 'foco', scrollT: number, poses: Record<SectionId, Pose>, foco: Pose): Pose {
  return mode === 'foco' ? foco : poseAt(scrollT, poses)
}

/**
 * Pose de foco que enquadra só o monitor, recuando até `fitWidth` (m) caber na largura da tela.
 * Usada no celular, onde a tela em retrato é estreita demais para a pose de foco do desktop.
 */
export function fitMonitorPose(monitor: [number, number, number], aspect: number, fovDeg: number, fitWidth: number): Pose {
  const halfH = Math.atan(Math.tan((fovDeg * Math.PI) / 360) * aspect)
  const dist = fitWidth / 2 / Math.tan(halfH)
  return { position: [monitor[0], monitor[1], monitor[2] + dist], target: [...monitor] }
}
