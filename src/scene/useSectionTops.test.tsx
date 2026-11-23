import { act, render } from '@testing-library/react'
import { expect, test } from 'vitest'
import { SECTIONS } from './sections'
import { useSectionTops } from './useSectionTops'

let seen: number[] = []
function Probe() {
  seen = useSectionTops()
  return (
    <>
      {SECTIONS.map((id) => (
        <section key={id} id={id} />
      ))}
    </>
  )
}

function mockTops(values: number[]) {
  SECTIONS.forEach((id, i) => {
    Object.defineProperty(document.getElementById(id)!, 'offsetTop', { configurable: true, value: values[i] })
  })
}

test('mede os topos das seções e remede ao redimensionar a janela', () => {
  const { rerender } = render(<Probe />)
  mockTops([0, 700, 1400, 2100, 2800])
  act(() => { window.dispatchEvent(new Event('resize')) })
  rerender(<Probe />)
  expect(seen).toEqual([0, 700, 1400, 2100, 2800])

  mockTops([0, 900, 1800, 2700, 3600])
  act(() => { window.dispatchEvent(new Event('resize')) })
  rerender(<Probe />)
  expect(seen).toEqual([0, 900, 1800, 2700, 3600])
})
