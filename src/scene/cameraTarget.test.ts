import { expect, test } from 'vitest'
import { cameraTarget } from './cameraTarget'
import { poseAt, SECTIONS, type Pose, type SectionId } from './sections'

const poses = Object.fromEntries(SECTIONS.map((id, i) => [id, { position: [i, 0, 0], target: [0, i, 0] } as Pose])) as Record<SectionId, Pose>
const foco: Pose = { position: [9, 9, 9], target: [0, 1, 0] }

test('no foco a câmera ignora a rolagem e vai para a pose de foco', () => {
  expect(cameraTarget('foco', 2.3, poses, foco)).toEqual(foco)
})

test('na rolagem a câmera segue a pose da seção', () => {
  expect(cameraTarget('scroll', 2.3, poses, foco)).toEqual(poseAt(2.3, poses))
})
