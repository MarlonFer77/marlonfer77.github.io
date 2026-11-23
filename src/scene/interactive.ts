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
