import { Object3D, Scene } from 'three'
import { expect, test } from 'vitest'
import { findLive } from './findLive'

const named = (name: string) => Object.assign(new Object3D(), { name })

test('quando a sala provisória sai de cena, encontra a tela do celular da sala final', () => {
  const scene = new Scene()
  const provisoria = named('celular_tela')
  scene.add(provisoria)
  let cached = findLive(null, scene, 'celular_tela')
  expect(cached).toBe(provisoria)

  scene.remove(provisoria)
  const final = named('celular_tela')
  scene.add(final)
  cached = findLive(cached, scene, 'celular_tela')
  expect(cached).toBe(final)
})

test('enquanto o objeto guardado continua na cena, não procura de novo', () => {
  const scene = new Scene()
  const tela = named('celular_tela')
  scene.add(tela)
  expect(findLive(tela, scene, 'celular_tela')).toBe(tela)
})

test('detecta quando o grupo inteiro da sala provisória foi removido (a tela continua presa ao grupo)', () => {
  const scene = new Scene()
  const grupo = named('sala_provisoria')
  const provisoria = named('celular_tela')
  grupo.add(provisoria)
  scene.add(grupo)
  let cached = findLive(null, scene, 'celular_tela')
  scene.remove(grupo)
  const final = named('celular_tela')
  scene.add(final)
  cached = findLive(cached, scene, 'celular_tela')
  expect(cached).toBe(final)
})
