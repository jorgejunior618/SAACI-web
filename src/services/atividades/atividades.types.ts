import * as v from 'valibot'

export const ComprovanteSchema = v.object({
  nome: v.string(),
  tamanhoBytes: v.number(),
  tipo: v.string(),
  hasCopiaReduzida: v.boolean(),
})

export const AtividadeSchema = v.object({
  id: v.string(),
  itemNumero: v.pipe(v.number(), v.integer(), v.minValue(1)),
  nome: v.pipe(v.string(), v.minLength(1)),
  quantidade: v.pipe(v.number(), v.minValue(0)),
  dataFim: v.pipe(v.string(), v.isoDate()),
  registradaEm: v.pipe(v.string(), v.isoTimestamp()),
  comprovante: ComprovanteSchema,
})

export type Atividade = v.InferOutput<typeof AtividadeSchema>
export type Comprovante = v.InferOutput<typeof ComprovanteSchema>

export type DadosAtividade = Pick<Atividade, 'itemNumero' | 'nome' | 'quantidade' | 'dataFim'>

export type CreateAtividadeInput = DadosAtividade & {
  arquivo: File
}

// O comprovante não muda na correção: para trocar o arquivo, remove e registra de novo.
export type UpdateAtividadeInput = DadosAtividade & {
  id: string
}

// O que a leitura do comprovante conseguiu sugerir. Campo null é campo que não foi lido.
export type LeituraComprovante = {
  itemSugerido: number
  nome: string | null
  quantidade: number | null
  dataFim: string | null
}

// O que dá para abrir de um comprovante neste navegador.
export type ArquivoDoComprovante = {
  url: string
  nomeArquivo: string
  // original: o arquivo escolhido nesta aba. copia: a versão reduzida guardada no navegador.
  origem: 'original' | 'copia'
}

export type ProgressoDownload = {
  arquivosProntos: number
  totalArquivos: number
  bytesProntos: number
  totalBytes: number
}
