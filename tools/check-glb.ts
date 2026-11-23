// Confere o GLB da sala: tamanho máximo e nomes que o site procura.
// Uso: node tools/check-glb.ts [caminho]   (padrão: public/models/sala.glb)
import { readFileSync, statSync } from 'node:fs'

export const MAX_BYTES = 3 * 1024 * 1024
const SECTIONS = ['inicio', 'projetos', 'habilidades', 'sobre', 'contato']
export const REQUIRED_NODES = [
  'monitor_tela', 'estante', 'celular', 'porta_retrato',
  ...SECTIONS.flatMap((s) => [`cam_${s}`, `alvo_${s}`]),
]

export async function checkGlb(path: string): Promise<{ bytes: number; missing: string[] }> {
  const bytes = statSync(path).size
  // Lê só o bloco JSON do GLB: os nomes dos nós bastam, e assim extensões
  // como EXT_texture_webp não precisam ser decodificadas.
  const glb = readFileSync(path)
  const jsonLen = glb.readUInt32LE(12)
  const json = JSON.parse(glb.subarray(20, 20 + jsonLen).toString('utf8')) as { nodes?: { name?: string }[] }
  const names = (json.nodes ?? []).map((n) => n.name ?? '')
  return { bytes, missing: REQUIRED_NODES.filter((n) => !names.includes(n)) }
}

if (process.argv[1]?.endsWith('check-glb.ts')) {
  const path = process.argv[2] ?? 'public/models/sala.glb'
  const { bytes, missing } = await checkGlb(path)
  const mb = (bytes / 1024 / 1024).toFixed(2)
  if (bytes > MAX_BYTES) console.error(`✗ ${path}: ${mb} MB (máximo 3 MB)`)
  if (missing.length) console.error(`✗ faltam no GLB: ${missing.join(', ')}`)
  if (bytes > MAX_BYTES || missing.length) process.exit(1)
  console.log(`✓ ${path}: ${mb} MB, todos os ${REQUIRED_NODES.length} nomes presentes`)
}
