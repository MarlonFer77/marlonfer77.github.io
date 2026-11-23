import { useEffect, useState } from 'react'

export const STACKED_MAX_WIDTH = 767

/** Em telas estreitas aplica body.layout--stacked: cena em cima, texto embaixo. */
export function useStackedLayout(): boolean {
  const [stacked, setStacked] = useState(() => window.innerWidth <= STACKED_MAX_WIDTH)

  useEffect(() => {
    const update = () => setStacked(window.innerWidth <= STACKED_MAX_WIDTH)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('layout--stacked', stacked)
    document.documentElement.classList.toggle('layout--stacked', stacked)
    window.dispatchEvent(new Event('resize'))
  }, [stacked])

  return stacked
}
