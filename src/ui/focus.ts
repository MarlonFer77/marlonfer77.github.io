export type FocusState = { mode: 'scroll' | 'foco'; openId: string | null }

export type FocusAction =
  | { type: 'enter' }
  | { type: 'exit' }
  | { type: 'open'; id: string }
  | { type: 'close' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'escape' }

export const INITIAL_FOCUS: FocusState = { mode: 'scroll', openId: null }

/** Regras do modo foco. `ids` é a ordem dos projetos (anterior/próximo dão a volta). */
export function focusReducer(s: FocusState, a: FocusAction, ids: string[]): FocusState {
  const step = (d: number): FocusState => {
    if (!s.openId || ids.length === 0) return s
    const i = ids.indexOf(s.openId)
    return { ...s, openId: ids[(i + d + ids.length) % ids.length] }
  }
  switch (a.type) {
    case 'enter': return { ...s, mode: 'foco' }
    case 'exit': return INITIAL_FOCUS
    case 'open': return ids.includes(a.id) ? { mode: 'foco', openId: a.id } : s
    case 'close': return { ...s, openId: null }
    case 'next': return step(1)
    case 'prev': return step(-1)
    case 'escape': return s.openId ? { ...s, openId: null } : INITIAL_FOCUS
  }
}
