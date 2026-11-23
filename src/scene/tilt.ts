type PointerLike = { pointerType: string; clientX: number; clientY: number }

/** Inclinação da câmera pelo mouse (-1..1). Toque é ignorado: no celular o dedo está rolando a página. */
export function pointerToTilt(e: PointerLike, width: number, height: number): { x: number; y: number } | null {
  if (e.pointerType === 'touch') return null
  return { x: (e.clientX / width) * 2 - 1, y: (e.clientY / height) * 2 - 1 }
}
