import type { FocusState } from '../ui/focus'
import type { Quality } from './quality'

/** Feixe, varredura e brilho só aparecem com holograma aberto, no desktop e em qualidade total. */
export function showFx(state: FocusState, stacked: boolean, quality: Quality): boolean {
  return state.openId !== null && !stacked && quality === 'full'
}
