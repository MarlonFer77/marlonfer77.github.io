export const SECTIONS = ['inicio', 'projetos', 'habilidades', 'sobre', 'contato'] as const
export type SectionId = (typeof SECTIONS)[number]

export type Vec3 = [number, number, number]
export type Pose = { position: Vec3; target: Vec3 }

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** Converte a rolagem em t contínuo: t = i exatamente no topo da seção i, linear entre topos. */
export function scrollToT(scrollY: number, tops: number[]): number {
  if (tops.length === 0) return 0
  const last = tops.length - 1
  if (scrollY <= tops[0]) return 0
  if (scrollY >= tops[last]) return last
  for (let i = 0; i < last; i++) {
    if (scrollY < tops[i + 1]) {
      const span = tops[i + 1] - tops[i]
      return span > 0 ? i + (scrollY - tops[i]) / span : i + 1
    }
  }
  return last
}

export function sectionAt(t: number): SectionId {
  return SECTIONS[clamp(Math.round(t), 0, SECTIONS.length - 1)]
}

const lerp3 = (a: Vec3, b: Vec3, e: number): Vec3 => [
  a[0] + (b[0] - a[0]) * e,
  a[1] + (b[1] - a[1]) * e,
  a[2] + (b[2] - a[2]) * e,
]

/** Interpola entre as poses vizinhas com smoothstep. */
export function poseAt(t: number, poses: Record<SectionId, Pose>): Pose {
  const tt = clamp(t, 0, SECTIONS.length - 1)
  const i = Math.min(Math.floor(tt), SECTIONS.length - 2)
  const f = tt - i
  const e = f * f * (3 - 2 * f)
  const a = poses[SECTIONS[i]]
  const b = poses[SECTIONS[i + 1]]
  return { position: lerp3(a.position, b.position, e), target: lerp3(a.target, b.target, e) }
}
