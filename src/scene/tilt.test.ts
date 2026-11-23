import { expect, test } from 'vitest'
import { pointerToTilt } from './tilt'

test('mouse no centro da tela não inclina; nos cantos inclina até ±1', () => {
  expect(pointerToTilt({ pointerType: 'mouse', clientX: 500, clientY: 400 }, 1000, 800)).toEqual({ x: 0, y: 0 })
  expect(pointerToTilt({ pointerType: 'mouse', clientX: 1000, clientY: 0 }, 1000, 800)).toEqual({ x: 1, y: -1 })
})

test('arrastar o dedo para rolar no celular não mexe a câmera', () => {
  expect(pointerToTilt({ pointerType: 'touch', clientX: 900, clientY: 100 }, 1000, 800)).toBeNull()
})
