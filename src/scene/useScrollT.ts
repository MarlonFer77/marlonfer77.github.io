import { useEffect, useRef, type MutableRefObject } from 'react'
import { scrollToT } from './sections'

/** Ref com o t atual da rolagem; atualiza sem re-renderizar (a cena lê a ref a cada quadro). */
export function useScrollT(tops: number[]): MutableRefObject<number> {
  const t = useRef(0)
  useEffect(() => {
    const update = () => { t.current = scrollToT(window.scrollY, tops) }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [tops])
  return t
}
