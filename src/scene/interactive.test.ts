import { Object3D } from 'three'
import { describe, expect, test } from 'vitest'
import { resolveSceneClick, sectionForObject } from './interactive'

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

describe('resolveSceneClick', () => {
  test('clicar no monitor fora do foco entra no foco', () => {
    expect(resolveSceneClick('monitor_tela', 'scroll')).toEqual({ type: 'enter' })
  })
  test('no foco, cliques no monitor ficam com os ícones', () => {
    expect(resolveSceneClick('monitor_tela', 'foco')).toBeNull()
  })
  test('outro objeto leva à seção dele; no foco, sai do foco antes', () => {
    expect(resolveSceneClick('estante', 'scroll')).toEqual({ type: 'goto', section: 'habilidades', exit: false })
    expect(resolveSceneClick('celular', 'foco')).toEqual({ type: 'goto', section: 'contato', exit: true })
  })
  test('clique no vazio sai do foco; fora do foco não faz nada', () => {
    expect(resolveSceneClick(null, 'foco')).toEqual({ type: 'exit' })
    expect(resolveSceneClick(null, 'scroll')).toBeNull()
  })
})
