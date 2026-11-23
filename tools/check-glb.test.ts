import { Document, NodeIO } from '@gltf-transform/core'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { checkGlb, REQUIRED_NODES } from './check-glb'

async function glbWith(names: string[]): Promise<string> {
  const doc = new Document()
  const scene = doc.createScene()
  for (const n of names) scene.addChild(doc.createNode(n))
  const bytes = await new NodeIO().writeBinary(doc)
  const file = join(mkdtempSync(join(tmpdir(), 'glb-')), 'sala.glb')
  writeFileSync(file, bytes)
  return file
}

test('aponta os objetos e câmeras que faltam', async () => {
  const r = await checkGlb(await glbWith(['monitor_tela']))
  expect(r.missing).toContain('estante')
  expect(r.missing).toContain('cam_inicio')
  expect(r.missing).not.toContain('monitor_tela')
})

test('modelo completo não tem pendências e informa o tamanho', async () => {
  const r = await checkGlb(await glbWith(REQUIRED_NODES))
  expect(r.missing).toEqual([])
  expect(r.bytes).toBeGreaterThan(0)
})

/** Reescreve o JSON de um GLB (para simular extensões exigidas pelo Blender). */
function withRequiredExtension(glb: Uint8Array, ext: string): Uint8Array {
  const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength)
  const jsonLen = view.getUint32(12, true)
  const json = JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + jsonLen)))
  json.extensionsRequired = [ext]
  json.extensionsUsed = [ext]
  let text = JSON.stringify(json)
  while (text.length % 4) text += ' '
  const jsonBytes = new TextEncoder().encode(text)
  const rest = glb.subarray(20 + jsonLen)
  const out = new Uint8Array(20 + jsonBytes.length + rest.length)
  const ov = new DataView(out.buffer)
  out.set(glb.subarray(0, 12))
  ov.setUint32(8, out.length, true)
  ov.setUint32(12, jsonBytes.length, true)
  ov.setUint32(16, 0x4e4f534a, true)
  out.set(jsonBytes, 20)
  out.set(rest, 20 + jsonBytes.length)
  return out
}

test('aceita GLB exportado com texturas WebP (EXT_texture_webp)', async () => {
  const doc = new Document()
  const scene = doc.createScene()
  for (const n of REQUIRED_NODES) scene.addChild(doc.createNode(n))
  const bytes = withRequiredExtension(await new NodeIO().writeBinary(doc), 'EXT_texture_webp')
  const file = join(mkdtempSync(join(tmpdir(), 'glb-')), 'webp.glb')
  writeFileSync(file, bytes)
  const r = await checkGlb(file)
  expect(r.missing).toEqual([])
})
