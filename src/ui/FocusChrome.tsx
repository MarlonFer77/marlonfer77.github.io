import { projects } from '../data/projects'
import { useFocus } from './FocusContext'
import { Hologram } from './Hologram'

/** Botão Voltar do modo foco e, no celular, o holograma como painel fixo. */
export function FocusChrome({ stacked }: { stacked: boolean }) {
  const { mode, openId, exitFocus, close, next, prev } = useFocus()
  if (mode !== 'foco') return null
  const project = openId ? projects.find((p) => p.id === openId) : undefined
  return (
    <>
      <button type="button" className="focus-back" onClick={exitFocus}>Voltar</button>
      {!openId && <p className="focus-hint">Escolha um projeto na tela do computador</p>}
      {stacked && project && <Hologram project={project} variant="sheet" onClose={close} onNext={next} onPrev={prev} />}
    </>
  )
}
