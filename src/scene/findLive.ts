import type { Object3D } from 'three'

const attachedTo = (o: Object3D, root: Object3D) => {
  let p: Object3D | null = o
  while (p && p !== root) p = p.parent
  return p === root
}

/** Devolve o objeto guardado se ainda estiver na cena; senão procura de novo pelo nome. */
export function findLive<T extends Object3D>(cached: T | null, scene: Object3D, name: string): T | null {
  if (cached && attachedTo(cached, scene)) return cached
  return (scene.getObjectByName(name) as T | undefined) ?? null
}
