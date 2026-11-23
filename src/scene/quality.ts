export type Quality = 'full' | 'low' | 'static'

export type QualityEnv = {
  webgl: boolean
  reducedMotion: boolean
  cores: number
  memoryGb?: number
  width: number
}

/** static = imagem no lugar da cena; low = dpr 1 e sem extras; full = tudo. */
export function pickQuality(env: QualityEnv): Quality {
  if (!env.webgl || env.reducedMotion) return 'static'
  if (env.cores <= 4 || (env.memoryGb ?? 8) <= 4 || env.width < 768) return 'low'
  return 'full'
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function detectQuality(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number }
  return pickQuality({
    webgl: hasWebGL(),
    reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    cores: nav.hardwareConcurrency ?? 8,
    memoryGb: nav.deviceMemory,
    width: window.innerWidth,
  })
}
