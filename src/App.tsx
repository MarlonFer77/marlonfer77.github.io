import { useState } from 'react'
import { ActiveProjectProvider } from './ui/ActiveProjectContext'
import { FocusProvider } from './ui/FocusContext'
import { Nav } from './ui/Nav'
import { Hero } from './ui/Hero'
import { ProjectsSection } from './ui/ProjectsSection'
import { SkillsSection } from './ui/SkillsSection'
import { AboutSection } from './ui/AboutSection'
import { ContactSection } from './ui/ContactSection'
import { Footer } from './ui/Footer'
import { useStackedLayout } from './ui/useStackedLayout'
import { detectQuality } from './scene/quality'
import { SceneSlot } from './scene/SceneSlot'

export default function App() {
  useStackedLayout()
  const [quality] = useState(detectQuality)
  return (
    <ActiveProjectProvider>
      <FocusProvider>
      <SceneSlot quality={quality} />
      <Nav />
      <main className="content">
        <Hero />
        <ProjectsSection />
        <SkillsSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      </FocusProvider>
    </ActiveProjectProvider>
  )
}
