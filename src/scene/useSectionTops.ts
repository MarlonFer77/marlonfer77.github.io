import { useEffect, useState } from 'react'
import { SECTIONS } from './sections'

/** Espaço reservado no topo ao rolar até uma seção (scroll-padding-top do <html>). */
function scrollPadding(): number {
  const v = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)
  return Number.isFinite(v) ? v : 0
}

/** Rolagem em que cada seção fica no lugar onde o navegador a deixa ao navegar até ela. */
function measure(): number[] {
  const pad = scrollPadding()
  return SECTIONS.map((id) => {
    const el = document.getElementById(id)
    if (!el) return 0
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - pad)
  })
}

const same = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i])

/** Posição de rolagem de cada seção; remede em resize e quando a altura da página muda. */
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
