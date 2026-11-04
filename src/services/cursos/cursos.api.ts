import { simularLatencia } from '../_mock'

import { CURSOS_MOCK } from './cursos.mock'
import type { Curso, CursoResumo } from './cursos.types'

const semAcento = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const toResumo = ({ id, nome, grau, campus, meta }: Curso): CursoResumo => ({
  id,
  nome,
  grau,
  campus,
  meta,
})

export async function getCursos(busca = ''): Promise<CursoResumo[]> {
  await simularLatencia()
  const termo = semAcento(busca.trim())

  return CURSOS_MOCK.filter((curso) => semAcento(curso.nome).includes(termo)).map(toResumo)
}

export async function getCurso(id: string): Promise<Curso | null> {
  await simularLatencia()
  return CURSOS_MOCK.find((curso) => curso.id === id) ?? null
}

// Leitura síncrona para quem já tem o id em mãos dentro de services/ (cálculo e formulário).
export function getCursoSync(id: string): Curso | null {
  return CURSOS_MOCK.find((curso) => curso.id === id) ?? null
}
