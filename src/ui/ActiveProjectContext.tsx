import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { projects } from '../data/projects'

type ActiveProject = { activeId: string; setActiveId: (id: string) => void }

const Ctx = createContext<ActiveProject | null>(null)

export function ActiveProjectProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState(projects[0]?.id ?? '')
  const value = useMemo(() => ({ activeId, setActiveId }), [activeId])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useActiveProject(): ActiveProject {
  const v = useContext(Ctx)
  if (!v) throw new Error('useActiveProject precisa estar dentro de ActiveProjectProvider')
  return v
}
