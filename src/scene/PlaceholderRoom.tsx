import { useTexture } from '@react-three/drei'
import { forwardRef, Suspense, type ReactNode } from 'react'
import { RoomBoundary } from './RoomBoundary'
import type { Group } from 'three'
import { profile } from '../data/profile'
import { skills } from '../data/skills'
import type { Pose, SectionId } from './sections'

/**
 * Sala provisória feita de primitivas, com os MESMOS nomes que o GLB do Blender vai ter:
 * monitor_tela, estante, celular, porta_retrato, cam_<secao>, alvo_<secao>.
 * Unidades em metros; chão em y = 0.
 */
export const PLACEHOLDER_POSES: Record<SectionId, Pose> = {
  inicio: { position: [2.6, 1.75, 2.9], target: [-0.6, 0.9, -1.0] },
  projetos: { position: [0.5, 1.12, 0.35], target: [0.5, 1.06, -1.2] },
  habilidades: { position: [1.1, 1.25, -0.2], target: [-2.2, 0.95, -0.95] },
  sobre: { position: [-0.05, 1.05, -0.25], target: [-0.32, 0.86, -1.1] },
  contato: { position: [0.05, 1.12, -0.15], target: [0.38, 0.8, -0.85] },
}

const Box = ({ args, position, color, name, children }: {
  args: [number, number, number]; position: [number, number, number]; color: string; name?: string; children?: ReactNode
}) => (
  <mesh name={name} position={position} castShadow receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.8} />
    {children}
  </mesh>
)

function Photo() {
  const tex = useTexture(profile.foto)
  return (
    <mesh position={[0, 0, 0.012]}>
      <planeGeometry args={[0.13, 0.17]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  )
}

export const PlaceholderRoom = forwardRef<Group>(function PlaceholderRoom(_props, ref) {
  return (
    <group ref={ref} data-testid="placeholder-room">
      {/* chão e paredes */}
      <Box args={[6, 0.05, 5]} position={[0, -0.025, 0]} color="#1a2233" />
      <Box args={[6, 3, 0.05]} position={[0, 1.5, -1.65]} color="#141c2b" />
      <Box args={[0.05, 3, 5]} position={[-2.25, 1.5, 0]} color="#121927" />

      {/* mesa */}
      <Box args={[1.7, 0.05, 0.75]} position={[0, 0.74, -1.05]} color="#6b4b32" />
      {[-0.8, 0.8].map((x) => <Box key={x} args={[0.05, 0.72, 0.7]} position={[x, 0.36, -1.05]} color="#4f3724" />)}

      {/* monitor */}
      <Box args={[0.06, 0.3, 0.06]} position={[0, 0.92, -1.3]} color="#2b3240" />
      <Box args={[0.98, 0.58, 0.04]} position={[0, 1.12, -1.32]} color="#1d2330" />
      <mesh name="monitor_tela" position={[0, 1.12, -1.297]}>
        <planeGeometry args={[0.92, 0.52]} />
        <meshStandardMaterial color="#7fb2ff" emissive="#7fb2ff" emissiveIntensity={0.35} />
      </mesh>
      <Box args={[0.5, 0.02, 0.16]} position={[0, 0.775, -0.9]} color="#2a303c" />

      {/* celular */}
      <group name="celular" position={[0.5, 0.772, -0.85]} rotation={[0, -0.3, 0]}>
        <Box args={[0.08, 0.012, 0.16]} position={[0, 0, 0]} color="#222833" />
        <mesh name="celular_tela" position={[0, 0.0065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.07, 0.145]} />
          <meshStandardMaterial color="#2ed3a0" emissive="#2ed3a0" emissiveIntensity={0.15} />
        </mesh>
      </group>

      {/* porta-retrato */}
      <group name="porta_retrato" position={[-0.5, 0.88, -1.15]} rotation={[-0.12, 0.35, 0]}>
        <Box args={[0.17, 0.21, 0.02]} position={[0, 0, 0]} color="#e9e1d2" />
        <RoomBoundary fallback={null}><Suspense fallback={null}><Photo /></Suspense></RoomBoundary>
      </group>

      {/* luminária */}
      <Box args={[0.14, 0.02, 0.14]} position={[0.7, 0.775, -1.2]} color="#2b3240" />
      <Box args={[0.02, 0.4, 0.02]} position={[0.7, 0.98, -1.2]} color="#2b3240" />
      <mesh position={[0.62, 1.17, -1.12]} rotation={[0.6, 0, 0.4]}>
        <coneGeometry args={[0.08, 0.12, 24, 1, true]} />
        <meshStandardMaterial color="#f2b35b" emissive="#f2b35b" emissiveIntensity={0.6} side={2} />
      </mesh>

      {/* estante: um volume por grupo de habilidades */}
      <group name="estante" position={[-1.9, 0, -1.25]}>
        <Box args={[0.5, 1.9, 0.62]} position={[0, 0.95, 0]} color="#3a2f4a" />
        <pointLight position={[0.9, 1.6, 0.3]} intensity={1.6} distance={3} color="#c9d8ff" />
        {skills.map((g, i) => (
          <mesh key={g.grupo} position={[0.08, 0.3 + i * 0.34, 0]}>
            <boxGeometry args={[0.34, 0.28, 0.5]} />
            <meshStandardMaterial color={g.cor} emissive={g.cor} emissiveIntensity={0.25} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* cadeira (decorativa) */}
      <group name="cadeira" position={[0.05, 0, -0.3]}>
        <Box args={[0.5, 0.06, 0.5]} position={[0, 0.48, 0]} color="#252c3a" />
        <Box args={[0.5, 0.6, 0.06]} position={[0, 0.8, 0.24]} color="#252c3a" />
        <Box args={[0.06, 0.45, 0.06]} position={[0, 0.23, 0]} color="#1a1f29" />
      </group>

      {/* planta */}
      <group position={[1.6, 0, -1.3]}>
        <Box args={[0.3, 0.35, 0.3]} position={[0, 0.175, 0]} color="#7a4e36" />
        <mesh position={[0, 0.6, 0]}><icosahedronGeometry args={[0.28, 0]} /><meshStandardMaterial color="#3f8f5f" flatShading /></mesh>
      </group>

      {/* empties de câmera, como o GLB terá */}
      {Object.entries(PLACEHOLDER_POSES).map(([id, p]) => (
        <group key={id}>
          <object3D name={`cam_${id}`} position={p.position} />
          <object3D name={`alvo_${id}`} position={p.target} />
        </group>
      ))}
    </group>
  )
})
