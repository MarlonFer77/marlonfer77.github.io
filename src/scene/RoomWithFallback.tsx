import { Component, Suspense, type ReactNode } from 'react'
import { PlaceholderRoom } from './PlaceholderRoom'
import { Room, type RoomInfo } from './Room'

/** Se o modelo final falhar (404, arquivo corrompido), mantém o que estiver em fallback. */
export class RoomBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('Sala 3D: usando a versão provisória.', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** Sala final do Blender; enquanto carrega ou se falhar, a sala provisória. */
export function RoomWithFallback({ onReady }: { onReady: (info: RoomInfo | null) => void }) {
  const placeholder = <PlaceholderRoom />
  return (
    <RoomBoundary fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <Room onReady={onReady} />
      </Suspense>
    </RoomBoundary>
  )
}
