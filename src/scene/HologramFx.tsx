import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, Color, DoubleSide, type ShaderMaterial } from 'three'
import type { Vec3 } from './sections'

const HOLO = new Color('#5aa8ff')

/** Gradiente vertical: forte embaixo (saindo da tela), sumindo em cima. */
const beamShader = {
  uniforms: { uColor: { value: HOLO }, uOpacity: { value: 0 } },
  vertexShader: /* glsl */ `
    varying float vY;
    void main() { vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor; uniform float uOpacity; varying float vY;
    void main() { gl_FragColor = vec4(uColor, (1.0 - vY) * 0.35 * uOpacity); }`,
}

/** Linhas de varredura que deslizam para cima + borda mais clara. */
const scanShader = {
  uniforms: { uColor: { value: HOLO }, uTime: { value: 0 }, uOpacity: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor; uniform float uTime; uniform float uOpacity; varying vec2 vUv;
    void main() {
      float lines = step(0.5, fract(vUv.y * 90.0 - uTime * 0.6)) * 0.10;
      float sweep = smoothstep(0.0, 0.04, 0.04 - abs(fract(uTime * 0.15) - vUv.y)) * 0.35;
      vec2 d = min(vUv, 1.0 - vUv);
      float edge = 1.0 - smoothstep(0.0, 0.012, min(d.x, d.y));
      gl_FragColor = vec4(uColor, (0.05 + lines + sweep + edge * 0.6) * uOpacity);
    }`,
}

/** Mancha radial: o brilho do holograma "caindo" na mesa (a sala tem luz gravada, então não é uma luz). */
const glowShader = {
  uniforms: { uColor: { value: HOLO }, uOpacity: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
    void main() { float r = distance(vUv, vec2(0.5)); gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, r) * 0.45 * uOpacity); }`,
}

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/**
 * Efeitos do holograma: feixe da tela até o painel, moldura com varredura atrás do painel e brilho na mesa.
 * Entram e saem com esmaecimento; sem animação de tempo para quem pede menos movimento.
 */
export function HologramFx({ monitor, lift, visible }: { monitor: Vec3; lift: number; visible: boolean }) {
  const [mx, my, mz] = monitor
  const mats = useRef<ShaderMaterial[]>([])
  const still = useMemo(reduceMotion, [])
  const beam = useMemo(() => ({ ...beamShader, uniforms: { ...beamShader.uniforms, uOpacity: { value: 0 } } }), [])
  const scan = useMemo(() => ({ ...scanShader, uniforms: { ...scanShader.uniforms, uTime: { value: 0 }, uOpacity: { value: 0 } } }), [])
  const glow = useMemo(() => ({ ...glowShader, uniforms: { ...glowShader.uniforms, uOpacity: { value: 0 } } }), [])

  useFrame((_, dt) => {
    for (const m of mats.current) {
      if (!m) continue
      const u = m.uniforms
      u.uOpacity.value += ((visible ? 1 : 0) - u.uOpacity.value) * Math.min(1, dt * 6)
      if (u.uTime && !still) u.uTime.value += dt
    }
  })

  const panelW = 1.42
  const panelH = 0.66
  const beamH = lift - 0.26 - panelH / 2 + 0.02
  const keep = (i: number) => (m: ShaderMaterial | null) => { if (m) mats.current[i] = m }
  return (
    <group renderOrder={5}>
      {/* feixe: cone aberto saindo do topo da tela até a base do painel */}
      <mesh position={[mx, my + 0.26 + beamH / 2, mz + 0.03]}>
        <cylinderGeometry args={[panelW / 2, 0.3, beamH, 32, 1, true]} />
        <shaderMaterial ref={keep(0)} args={[beam]} transparent depthWrite={false} blending={AdditiveBlending} side={DoubleSide} />
      </mesh>
      {/* moldura com varredura, logo atrás do painel HTML */}
      <mesh position={[mx, my + lift, mz + 0.035]}>
        <planeGeometry args={[panelW, panelH]} />
        <shaderMaterial ref={keep(1)} args={[scan]} transparent depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      {/* brilho na mesa, à frente do monitor */}
      <mesh position={[mx, 0.768, mz + 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.4, 0.7]} />
        <shaderMaterial ref={keep(2)} args={[glow]} transparent depthWrite={false} blending={AdditiveBlending} />
      </mesh>
    </group>
  )
}
