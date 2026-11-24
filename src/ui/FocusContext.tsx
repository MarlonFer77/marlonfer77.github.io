import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { projects } from '../data/projects'
import type { SectionId } from '../scene/sections'
import { focusReducer, INITIAL_FOCUS, type FocusAction, type FocusState } from './focus'
import { scrollToSection } from './scrollToSection'

type FocusApi = FocusState & {
  enterFocus: () => void
  /** Sai do foco; com `section`, termina rolando até ela em vez de voltar à posição anterior. */
  exitFocus: (section?: SectionId) => void
  open: (id: string) => void
  close: () => void
  next: () => void
  prev: () => void
}

const Ctx = createContext<FocusApi | null>(null)
const IDS = projects.map((p) => p.id)

const focusIfAlive = (el: HTMLElement | null) => {
  if (el && el.isConnected) el.focus({ preventScroll: true })
}

/**
 * Modo foco com histórico do navegador:
 * - entrar cria uma entrada (#foco); abrir um holograma cria outra (#foco-projeto);
 * - Voltar do navegador fecha o holograma, ou sai do foco se não houver holograma;
 * - sair/fechar pelo site desfaz as próprias entradas e só termina (rolagem, foco do teclado)
 *   quando o navegador confirma a navegação (popstate) — assim a restauração automática de
 *   rolagem do navegador não desfaz o que fizemos.
 */
export function FocusProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer((s: FocusState, a: FocusAction) => focusReducer(s, a, IDS), INITIAL_FOCUS)

  const prev = useRef(state)
  const savedScroll = useRef(0)
  const entries = useRef({ foco: false, holo: false })
  const fromPopstate = useRef(false)
  const awaitingOwnPop = useRef<null | (() => void)>(null)
  const exitTarget = useRef<SectionId | null>(null)
  const enterOpener = useRef<HTMLElement | null>(null)
  const holoOpener = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof history !== 'undefined' && 'scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])

  /** Desfaz `depth` entradas e roda `then` quando o navegador terminar (ou na hora, se não houver). */
  const goBack = (depth: number, then: () => void) => {
    if (depth <= 0) { then(); return }
    awaitingOwnPop.current = then
    if (depth === 1) history.back()
    else history.go(-depth)
  }

  useEffect(() => {
    const before = prev.current
    prev.current = state
    const html = document.documentElement
    const popped = fromPopstate.current
    fromPopstate.current = false

    // entrou no foco
    if (before.mode === 'scroll' && state.mode === 'foco') {
      savedScroll.current = window.scrollY
      html.classList.add('is-focus')
      history.pushState({ foco: 'sala' }, '', '#foco')
      entries.current.foco = true
    }

    // abriu um holograma (vindo de nenhum)
    if (!before.openId && state.openId && state.mode === 'foco') {
      history.pushState({ foco: 'projeto' }, '', '#foco-projeto')
      entries.current.holo = true
    }

    // fechou o holograma mas continua no foco
    if (before.openId && !state.openId && state.mode === 'foco') {
      const opener = holoOpener.current
      const finish = () => focusIfAlive(opener)
      if (entries.current.holo) {
        entries.current.holo = false
        if (popped) finish()
        else goBack(1, finish)
      } else finish()
    }

    // saiu do foco
    if (before.mode === 'foco' && state.mode === 'scroll') {
      html.classList.remove('is-focus')
      const target = exitTarget.current
      exitTarget.current = null
      const opener = enterOpener.current
      const finish = () => {
        if (target) scrollToSection(target)
        else window.scrollTo({ top: savedScroll.current, behavior: 'instant' })
        if (!target) focusIfAlive(opener)
      }
      // se veio do Voltar do navegador, uma entrada já saiu
      const depth = (entries.current.foco ? 1 : 0) + (entries.current.holo ? 1 : 0) - (popped ? 1 : 0)
      entries.current = { foco: false, holo: false }
      if (depth > 0) { awaitingOwnPop.current = finish; history.go(-depth) }
      else finish()
    }
  }, [state])

  // Esc e Voltar do navegador.
  const stateRef = useRef(state)
  stateRef.current = state
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stateRef.current.mode === 'foco') dispatch({ type: 'escape' })
    }
    const onPop = () => {
      const own = awaitingOwnPop.current
      if (own) { awaitingOwnPop.current = null; own(); return }
      if (stateRef.current.mode !== 'foco') return
      fromPopstate.current = true
      dispatch({ type: stateRef.current.openId ? 'close' : 'exit' })
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPop)
    }
  }, [])

  const active = () => (document.activeElement instanceof HTMLElement ? document.activeElement : null)
  const enterFocus = useCallback(() => { enterOpener.current = active(); dispatch({ type: 'enter' }) }, [])
  const exitFocus = useCallback((section?: SectionId) => { exitTarget.current = section ?? null; dispatch({ type: 'exit' }) }, [])
  const open = useCallback((id: string) => {
    if (!stateRef.current.openId) holoOpener.current = active()
    if (stateRef.current.mode === 'scroll') enterOpener.current = active()
    dispatch({ type: 'open', id })
  }, [])
  const close = useCallback(() => dispatch({ type: 'close' }), [])
  const next = useCallback(() => dispatch({ type: 'next' }), [])
  const prevP = useCallback(() => dispatch({ type: 'prev' }), [])

  const value = useMemo(() => ({ ...state, enterFocus, exitFocus, open, close, next, prev: prevP }),
    [state, enterFocus, exitFocus, open, close, next, prevP])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFocus(): FocusApi {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFocus precisa estar dentro de FocusProvider')
  return v
}
