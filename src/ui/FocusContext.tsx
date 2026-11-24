import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { projects } from '../data/projects'
import { focusReducer, INITIAL_FOCUS, type FocusAction, type FocusState } from './focus'

type FocusApi = FocusState & {
  enterFocus: () => void
  exitFocus: () => void
  open: (id: string) => void
  close: () => void
  next: () => void
  prev: () => void
}

const Ctx = createContext<FocusApi | null>(null)
const IDS = projects.map((p) => p.id)

/**
 * Modo foco: trava a rolagem (html.is-focus), cria uma entrada no histórico (Voltar do navegador sai)
 * e devolve a página exatamente para onde estava ao sair.
 */
export function FocusProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer((s: FocusState, a: FocusAction) => focusReducer(s, a, IDS), INITIAL_FOCUS)
  const savedScroll = useRef(0)
  const pushed = useRef(false)
  const fromPopstate = useRef(false)
  const prevMode = useRef(state.mode)

  const dispatch = rawDispatch

  // Efeitos de entrar e sair do foco.
  useEffect(() => {
    if (prevMode.current === state.mode) return
    prevMode.current = state.mode
    const html = document.documentElement
    if (state.mode === 'foco') {
      savedScroll.current = window.scrollY
      html.classList.add('is-focus')
      history.pushState({ foco: true }, '', '#foco')
      pushed.current = true
    } else {
      html.classList.remove('is-focus')
      window.scrollTo(0, savedScroll.current)
      if (pushed.current && !fromPopstate.current) history.back()
      pushed.current = false
      fromPopstate.current = false
    }
  }, [state.mode])

  // Esc e Voltar do navegador.
  const stateRef = useRef(state)
  stateRef.current = state
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stateRef.current.mode === 'foco') dispatch({ type: 'escape' })
    }
    const onPop = () => {
      if (stateRef.current.mode !== 'foco') return
      fromPopstate.current = true
      dispatch({ type: 'exit' })
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPop)
    }
  }, [dispatch])

  const enterFocus = useCallback(() => dispatch({ type: 'enter' }), [dispatch])
  const exitFocus = useCallback(() => dispatch({ type: 'exit' }), [dispatch])
  const open = useCallback((id: string) => dispatch({ type: 'open', id }), [dispatch])
  const close = useCallback(() => dispatch({ type: 'close' }), [dispatch])
  const next = useCallback(() => dispatch({ type: 'next' }), [dispatch])
  const prev = useCallback(() => dispatch({ type: 'prev' }), [dispatch])

  const value = useMemo(() => ({ ...state, enterFocus, exitFocus, open, close, next, prev }),
    [state, enterFocus, exitFocus, open, close, next, prev])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFocus(): FocusApi {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFocus precisa estar dentro de FocusProvider')
  return v
}
