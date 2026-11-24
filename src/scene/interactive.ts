import type { Object3D } from 'three'
import type { SectionId } from './sections'

export const OBJECT_TO_SECTION: Record<string, SectionId> = {
  monitor_tela: 'projetos',
  estante: 'habilidades',
  porta_retrato: 'sobre',
  celular: 'contato',
}

/** Sobe pelos pais até achar um objeto interativo; null se for decorativo. */
export function sectionForObject(obj: Object3D | null): SectionId | null {
  for (let o: Object3D | null = obj; o; o = o.parent) {
    const s = OBJECT_TO_SECTION[o.name]
    if (s) return s
  }
  return null
}

/** Nome do objeto interativo clicado (sobe pelos pais), ou null se for decorativo/vazio. */
export function interactiveName(obj: Object3D | null): string | null {
  for (let o: Object3D | null = obj; o; o = o.parent) if (OBJECT_TO_SECTION[o.name]) return o.name
  return null
}

export type SceneClick =
  | { type: 'enter' }
  | { type: 'goto'; section: SectionId; exit: boolean }
  | { type: 'exit' }
  | null

/** O que um clique na sala faz, conforme o objeto e o modo atual. */
export function resolveSceneClick(name: string | null, mode: 'scroll' | 'foco'): SceneClick {
  if (name === 'monitor_tela') return mode === 'scroll' ? { type: 'enter' } : null
  const section = name ? OBJECT_TO_SECTION[name] : undefined
  if (section) return { type: 'goto', section, exit: mode === 'foco' }
  return mode === 'foco' ? { type: 'exit' } : null
}
