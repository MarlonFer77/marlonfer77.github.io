import { Object3D } from 'three'
import { expect, test } from 'vitest'
import { sectionForObject } from './interactive'

const named = (name: string, parent?: Object3D) => {
  const o = new Object3D()
  o.name = name
  parent?.add(o)
  return o
}

test('objeto interativo leva à sua seção', () => {
  expect(sectionForObject(named('estante'))).toBe('habilidades')
  expect(sectionForObject(named('monitor_tela'))).toBe('projetos')
  expect(sectionForObject(named('porta_retrato'))).toBe('sobre')
})

test('mesh filho herda a seção do objeto pai', () => {
  const celular = named('celular')
  const tela = named('celular_tela', celular)
  expect(sectionForObject(tela)).toBe('contato')
})

test('objeto decorativo não leva a lugar nenhum', () => {
  expect(sectionForObject(named('cadeira'))).toBeNull()
})
