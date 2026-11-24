import { MeshBasicMaterial, MeshStandardMaterial, type Mesh, type Object3D } from 'three'

/** Objetos que continuam com material iluminado (mudam de brilho no site). */
const KEEP_LIT = new Set(['celular_tela'])

/** A luz já vem gravada nas texturas do Blender: troca por materiais sem iluminação. */
export function toUnlit(root: Object3D): void {
  root.traverse((o) => {
    const mesh = o as Mesh
    if (!mesh.isMesh || KEEP_LIT.has(mesh.name)) return
    const m = mesh.material as MeshStandardMaterial
    if (!(m instanceof MeshStandardMaterial)) return
    mesh.material = m.map
      ? new MeshBasicMaterial({ map: m.map })
      : new MeshBasicMaterial({ color: m.emissive.getHex() ? m.emissive : m.color })
    m.dispose()
  })
}
