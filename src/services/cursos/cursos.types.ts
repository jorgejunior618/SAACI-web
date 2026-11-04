// Unidade em que o aluno informa a quantidade de um item.
export type Unidade =
  | { tipo: 'horas'; complemento: string } // "40h de curso"
  | { tipo: 'contagem'; singular: string; plural: string } // "3 palestras"
  | { tipo: 'qualis' } // fator Qualis do evento ou periódico

// valor = quantidade × horas ÷ por. Ex.: item 7, 40h de curso × 1 ÷ 4 = 10h.
export type Conversao = {
  horas: number
  por: number
}

export type Item = {
  numero: number
  nome: string
  nomeCurto: string
  regraResumo: string
  regraTexto: string
  limite: number
  unidade: Unidade
  conversao: Conversao
  campoQuantidade: string
  dicaQuantidade?: string
}

export type Curso = {
  id: string
  nome: string
  grau: string
  campus: string
  meta: number
  itens: readonly Item[]
  cabecalhoFormulario: string
  modeloConferidoEm: string
}

export type CursoResumo = Pick<Curso, 'id' | 'nome' | 'grau' | 'campus' | 'meta'>
