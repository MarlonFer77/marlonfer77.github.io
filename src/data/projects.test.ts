import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { projects, splitProjects } from './projects'
import { profile } from './profile'
import { skills } from './skills'
import type { Project } from './types'

describe('projetos', () => {
  test('ids são únicos', () => {
    const ids = projects.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('todo projeto tem problema, solução e resultado', () => {
    for (const p of projects) {
      expect(p.problema.trim(), p.id).not.toBe('')
      expect(p.solucao.trim(), p.id).not.toBe('')
      expect(p.resultado.trim(), p.id).not.toBe('')
      expect(p.stack.length, p.id).toBeGreaterThan(0)
    }
  })

  test('projeto interno nunca tem link de código ou demo', () => {
    for (const p of projects.filter((p) => p.tipo === 'interno')) {
      expect(p.github, p.id).toBeUndefined()
      expect(p.demo, p.id).toBeUndefined()
    }
  })

  test('toda imagem citada existe em public/', () => {
    for (const p of projects) {
      for (const img of p.imagens) {
        expect(existsSync(join('public', img)), `${p.id}: ${img}`).toBe(true)
      }
    }
  })
})

describe('splitProjects', () => {
  const fake = (i: number, titulo = `Projeto ${i}`): Project => ({
    id: `p${i}`, titulo, tipo: 'pessoal', destaque: true,
    problema: 'x', solucao: 'y', resultado: 'z', stack: ['TS'], imagens: [],
  })

  test('limita destaques a 6 e manda o excedente para outros, na ordem', () => {
    const list = Array.from({ length: 8 }, (_, i) => fake(i))
    const { destaques, outros } = splitProjects(list)
    expect(destaques.map((p) => p.id)).toEqual(['p0', 'p1', 'p2', 'p3', 'p4', 'p5'])
    expect(outros.map((p) => p.id)).toEqual(['p6', 'p7'])
  })

  test('não destacados vão para outros', () => {
    const list = [fake(0), { ...fake(1), destaque: false }]
    expect(splitProjects(list).outros.map((p) => p.id)).toEqual(['p1'])
  })

  test('aceita títulos longos', () => {
    expect(() => splitProjects([fake(0, 'x'.repeat(120))])).not.toThrow()
  })
})

test('contatos são exatamente os aprovados', () => {
  expect(profile.contatos).toEqual({
    email: 'dev.marlonfer77@gmail.com',
    linkedin: 'https://www.linkedin.com/in/marlonferreira77/',
    github: 'https://github.com/MarlonFer77',
    whatsapp: 'https://wa.me/5521989844071',
  })
})

test('cada grupo de habilidades tem cor e itens', () => {
  expect(skills.length).toBeGreaterThan(0)
  for (const g of skills) {
    expect(g.cor).toMatch(/^#[0-9a-f]{6}$/i)
    expect(g.itens.length).toBeGreaterThan(0)
  }
})
