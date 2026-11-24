import { expect, test } from 'vitest'
import { cameraTarget, fitMonitorPose } from './cameraTarget'
import { poseAt, SECTIONS, type Pose, type SectionId } from './sections'

const poses = Object.fromEntries(SECTIONS.map((id, i) => [id, { position: [i, 0, 0], target: [0, i, 0] } as Pose])) as Record<SectionId, Pose>
const foco: Pose = { position: [9, 9, 9], target: [0, 1, 0] }

test('no foco a câmera ignora a rolagem e vai para a pose de foco', () => {
  expect(cameraTarget('foco', 2.3, poses, foco)).toEqual(foco)
})

test('na rolagem a câmera segue a pose da seção', () => {
  expect(cameraTarget('scroll', 2.3, poses, foco)).toEqual(poseAt(2.3, poses))
})

test('no celular (retrato), a câmera de foco recua até o monitor caber na largura da tela', () => {
  const monitor: [number, number, number] = [0, 1.12, -1.3]
  const p = fitMonitorPose(monitor, 375 / 812, 42, 1.1)
  expect(p.target).toEqual(monitor)
  const dist = p.position[2] - monitor[2]
  const halfH = Math.atan(Math.tan((42 * Math.PI) / 360) * (375 / 812))
  expect(2 * dist * Math.tan(halfH)).toBeCloseTo(1.1, 2)
  expect(p.position[0]).toBe(0)
  expect(p.position[1]).toBe(1.12)
})
