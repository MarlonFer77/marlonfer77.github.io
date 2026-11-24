export function Footer({ inert = false }: { inert?: boolean }) {
  return (
    <footer className="footer" inert={inert}>
      <p>© {new Date().getFullYear()} Marlon Ferreira. Sala 3D modelada no Blender e renderizada com React Three Fiber.</p>
    </footer>
  )
}
