import { lazy, Suspense, useState } from 'react'
import { ActiveProjectProvider } from './ui/ActiveProjectContext'
import { Nav } from './ui/Nav'
import { Hero } from './ui/Hero'
import { ProjectsSection } from './ui/ProjectsSection'
import { SkillsSection } from './ui/SkillsSection'
import { AboutSection } from './ui/AboutSection'
import { ContactSection } from './ui/ContactSection'
import { Footer } from './ui/Footer'
import { useStackedLayout } from './ui/useStackedLayout'
import { detectQuality } from './scene/quality'
import { StaticRoom } from './scene/StaticRoom'

const SceneCanvas = lazy(() => import('./scene/SceneCanvas'))

export default function App() {
  useStackedLayout()
  const [quality] = useState(detectQuality)
  return (
    <ActiveProjectProvider>
      {quality === 'static' ? (
        <StaticRoom />
      ) : (
        <Suspense fallback={<div className="scene scene--loading" aria-hidden="true" />}>
          <SceneCanvas dpr={quality === 'low' ? 1 : [1, 2]} />
        </Suspense>
      )}
      <Nav />
      <main className="content">
        <Hero />
        <ProjectsSection />
        <SkillsSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </ActiveProjectProvider>
  )
}
