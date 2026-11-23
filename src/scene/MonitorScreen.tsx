import { Html } from '@react-three/drei'
import { projects } from '../data/projects'
import { useActiveProject } from '../ui/ActiveProjectContext'

/** Tela do monitor: mostra o projeto selecionado na lista. Posição igual a monitor_tela. */
export function MonitorScreen({ position = [0, 1.12, -1.29] }: { position?: [number, number, number] }) {
  const { activeId } = useActiveProject()
  const p = projects.find((x) => x.id === activeId) ?? projects[0]
  return (
    <Html transform position={position} distanceFactor={0.5} pointerEvents="none" zIndexRange={[0, 0]}>
      <div className="monitor">
        <img src={p.imagens[0]} alt="" />
        <p className="monitor__title">{p.titulo}</p>
      </div>
    </Html>
  )
}
