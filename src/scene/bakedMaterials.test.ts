import { Color, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Texture } from 'three'
import { expect, test } from 'vitest'
import { toUnlit } from './bakedMaterials'

const mesh = (name: string, m: MeshStandardMaterial) => Object.assign(new Mesh(new PlaneGeometry(), m), { name })

test('material com luz gravada vira sem iluminação, mantendo a textura', () => {
  const map = new Texture()
  const o = mesh('mesa', new MeshStandardMaterial({ map }))
  toUnlit(o)
  expect(o.material).toBeInstanceOf(MeshBasicMaterial)
  expect((o.material as MeshBasicMaterial).map).toBe(map)
})

test('material só emissivo vira cor chapada com a cor da emissão', () => {
  const o = mesh('cupula', new MeshStandardMaterial({ emissive: new Color('#f2b35b') }))
  toUnlit(o)
  expect(o.material).toBeInstanceOf(MeshBasicMaterial)
  expect((o.material as MeshBasicMaterial).color.getHexString()).toBe(new Color('#f2b35b').getHexString())
})

test('tela do celular continua com material iluminado (ela acende em Contato)', () => {
  const o = mesh('celular_tela', new MeshStandardMaterial({ emissive: new Color('#2ed3a0') }))
  toUnlit(o)
  expect(o.material).toBeInstanceOf(MeshStandardMaterial)
})
