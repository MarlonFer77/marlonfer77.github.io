import { describe, expect, test } from 'vitest'
import { poseAt, scrollToT, sectionAt, SECTIONS, type Pose, type SectionId } from './sections'

const tops = [0, 800, 1600, 2400, 3200]

describe('scrollToT', () => {
  test('topo da página é 0', () => expect(scrollToT(0, tops)).toBe(0))
  test('exatamente no topo de uma seção dá o índice inteiro', () => expect(scrollToT(1600, tops)).toBe(2))
  test('entre dois topos é linear', () => expect(scrollToT(1200, tops)).toBe(1.5))
  test('rolagem negativa (elástico do navegador) limita em 0', () => expect(scrollToT(-50, tops)).toBe(0))
  test('além do fim limita na última seção', () => expect(scrollToT(9999, tops)).toBe(4))
  test('sem topos medidos devolve 0', () => expect(scrollToT(500, [])).toBe(0))
})

describe('sectionAt', () => {
  test('arredonda para a seção mais próxima', () => expect(sectionAt(3.4)).toBe('sobre'))
  test('limita fora do intervalo', () => {
    expect(sectionAt(-1)).toBe('inicio')
    expect(sectionAt(9)).toBe('contato')
  })
})

describe('poseAt', () => {
  const poses = Object.fromEntries(
    SECTIONS.map((id, i) => [id, { position: [i * 2, 0, 0], target: [0, i, 0] } as Pose]),
  ) as Record<SectionId, Pose>

  test('t inteiro devolve a pose da seção', () => expect(poseAt(1, poses)).toEqual(poses.projetos))
  test('meio do caminho interpola com suavização simétrica', () => {
    expect(poseAt(0.5, poses).position).toEqual([1, 0, 0])
    expect(poseAt(0.5, poses).target).toEqual([0, 0.5, 0])
  })
  test('suavização: 25% do caminho anda menos que 25%', () => {
    expect(poseAt(0.25, poses).position[0]).toBeLessThan(0.5)
  })
  test('último índice não estoura', () => expect(poseAt(4, poses)).toEqual(poses.contato))
})
