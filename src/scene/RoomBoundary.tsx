import { Component, type ReactNode } from 'react'

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
