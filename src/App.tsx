import { useState, type ReactNode } from 'react'
import { ActiveProjectProvider } from './ui/ActiveProjectContext'
import { FocusProvider, useFocus } from './ui/FocusContext'
import { QualityContext, useQuality } from './ui/QualityContext'
import { Nav } from './ui/Nav'
import { Hero } from './ui/Hero'
import { ProjectsSection } from './ui/ProjectsSection'
import { SkillsSection } from './ui/SkillsSection'
import { AboutSection } from './ui/AboutSection'
import { ContactSection } from './ui/ContactSection'
import { Footer } from './ui/Footer'
import { FocusChrome } from './ui/FocusChrome'
import { useStackedLayout } from './ui/useStackedLayout'
import { detectQuality, type Quality } from './scene/quality'
import { SceneSlot } from './scene/SceneSlot'

export function AppProviders({ quality, children }: { quality: Quality; children: ReactNode }) {
  return (
    <QualityContext.Provider value={quality}>
      <ActiveProjectProvider>
        <FocusProvider>{children}</FocusProvider>
      </ActiveProjectProvider>
    </QualityContext.Provider>
  )
}

/** Página: cena ao fundo, texto por cima; no modo foco o texto fica inerte e some. */
export function AppShell() {
  const stacked = useStackedLayout()
  const quality = useQuality()
  const { mode } = useFocus()
  const focused = mode === 'foco'
  return (
    <>
      <SceneSlot quality={quality} />
      <Nav inert={focused} />
      <main className="content" inert={focused}>
        <Hero />
        <ProjectsSection />
        <SkillsSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer inert={focused} />
      <FocusChrome stacked={stacked} />
    </>
  )
}

export default function App() {
  const [quality] = useState(detectQuality)
  return (
    <AppProviders quality={quality}>
      <AppShell />
    </AppProviders>
  )
}
