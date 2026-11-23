import { lazy, Suspense } from 'react'
import { ActiveProjectProvider } from './ui/ActiveProjectContext'
import { Nav } from './ui/Nav'
import { Hero } from './ui/Hero'
import { ProjectsSection } from './ui/ProjectsSection'
import { SkillsSection } from './ui/SkillsSection'
import { AboutSection } from './ui/AboutSection'
import { ContactSection } from './ui/ContactSection'
import { Footer } from './ui/Footer'
import { useStackedLayout } from './ui/useStackedLayout'

const SceneCanvas = lazy(() => import('./scene/SceneCanvas'))

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function App() {
  useStackedLayout()
  const webgl = hasWebGL()
  return (
    <ActiveProjectProvider>
      {webgl && (
        <Suspense fallback={null}>
          <SceneCanvas />
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
