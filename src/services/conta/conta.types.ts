import type { CursoResumo } from '../cursos/cursos.types'

export type Sessao = {
  email: string
  nome: string | null
  matricula: string | null
  ingresso: string | null
  curso: CursoResumo | null
  isEmailConfirmado: boolean
  // Quando o último link de confirmação saiu (RF39).
  linkEnviadoEm: string
}

export type PerfilInput = {
  nome?: string | null
  matricula?: string | null
  ingresso?: string
}
