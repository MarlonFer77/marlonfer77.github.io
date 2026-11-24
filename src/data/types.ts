export type ProjectKind = 'interno' | 'pessoal'

export type Project = {
  id: string
  titulo: string
  tipo: ProjectKind
  destaque: boolean
  problema: string
  solucao: string
  resultado: string
  stack: string[]
  /** Caminhos relativos a public/, ex.: 'img/projetos/x.webp' */
  imagens: string[]
  github?: string
  demo?: string
}

export type SkillGroup = { grupo: string; cor: string; itens: string[] }

export type Profile = {
  nome: string
  cargo: string
  resumo: string
  foto: string
  contatos: { email: string; linkedin: string; github: string; whatsapp: string }
  curriculo?: string
}
