import { Group, Object3D } from 'three'
import { describe, expect, test } from 'vitest'
import { readPoses } from './readPoses'
import { SECTIONS } from './sections'

function sceneWith(skip?: string) {
  const root = new Group()
  const offset = new Group()
  offset.position.set(10, 0, 0) // pai deslocado: a pose deve sair em coordenadas do mundo
  root.add(offset)
  SECTIONS.forEach((id, i) => {
    for (const kind of ['cam', 'alvo'] as const) {
      const name = `${kind}_${id}`
      if (name === skip) continue
      const o = new Object3D()
      o.name = name
      o.position.set(i, kind === 'cam' ? 1 : 0, 0)
      offset.add(o)
    }
  })
  return root
}

describe('readPoses', () => {
  test('lê câmera e alvo de cada seção em coordenadas do mundo', () => {
    const poses = readPoses(sceneWith())
    expect(poses.habilidades).toEqual({ position: [12, 1, 0], target: [12, 0, 0] })
    expect(Object.keys(poses)).toEqual([...SECTIONS])
  })

  test('erro lista os nomes que faltam', () => {
    expect(() => readPoses(sceneWith('cam_sobre'))).toThrow(/cam_sobre/)
  })
})
