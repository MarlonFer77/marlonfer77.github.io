import { Suspense } from 'react'
import { RoomBoundary } from './RoomBoundary'
import { PlaceholderRoom } from './PlaceholderRoom'
import { Room, type RoomInfo } from './Room'

export { RoomBoundary }

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
