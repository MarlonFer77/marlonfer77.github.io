import { Group, Object3D } from 'three'
import { describe, expect, test } from 'vitest'
import { readFocusPose, readPoses } from './readPoses'
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

describe('readFocusPose', () => {
  const withFocus = (skip?: string) => {
    const root = new Group()
    for (const [name, p] of [['cam_foco', [0, 1.2, 0.4]], ['alvo_foco', [0, 1.25, -1.3]]] as const) {
      if (name === skip) continue
      const o = new Object3D()
      o.name = name
      o.position.set(...p)
      root.add(o)
    }
    return root
  }
  test('lê a pose de foco', () => {
    expect(readFocusPose(withFocus())).toEqual({ position: [0, 1.2, 0.4], target: [0, 1.25, -1.3] })
  })
  test('erro cita o nome ausente', () => {
    expect(() => readFocusPose(withFocus('alvo_foco'))).toThrow(/alvo_foco/)
  })
})
