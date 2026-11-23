import { expect, test } from 'vitest'
import { pickQuality } from './quality'

const strong = { webgl: true, reducedMotion: false, cores: 8, memoryGb: 8, width: 1440 }

test('sem WebGL mostra a imagem estática', () => expect(pickQuality({ ...strong, webgl: false })).toBe('static'))
test('quem pede menos movimento recebe a imagem estática', () => expect(pickQuality({ ...strong, reducedMotion: true })).toBe('static'))
test('4 núcleos usa qualidade baixa', () => expect(pickQuality({ ...strong, cores: 4 })).toBe('low'))
test('2 GB de memória usa qualidade baixa', () => expect(pickQuality({ ...strong, memoryGb: 2 })).toBe('low'))
test('tela de celular usa qualidade baixa', () => expect(pickQuality({ ...strong, width: 375 })).toBe('low'))
test('memória desconhecida não rebaixa', () => expect(pickQuality({ ...strong, memoryGb: undefined })).toBe('full'))
test('máquina forte usa qualidade total', () => expect(pickQuality(strong)).toBe('full'))
