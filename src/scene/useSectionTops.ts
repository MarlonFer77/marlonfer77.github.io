import { useEffect, useState } from 'react'
import { SECTIONS } from './sections'

function measure(): number[] {
  return SECTIONS.map((id) => document.getElementById(id)?.offsetTop ?? 0)
}

const same = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i])

/** Topos (offsetTop) de cada seção; remede em resize e quando a altura da página muda. */
export function useSectionTops(): number[] {
  const [tops, setTops] = useState<number[]>([])

  useEffect(() => {
    const update = () => setTops((prev) => {
      const next = measure()
      return same(prev, next) ? prev : next
    })
    update()
    window.addEventListener('resize', update)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    ro?.observe(document.body)
    return () => {
      window.removeEventListener('resize', update)
      ro?.disconnect()
    }
  }, [])

  return tops
}
