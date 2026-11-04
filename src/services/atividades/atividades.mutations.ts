import type { QueryClient } from '@tanstack/react-query'
import * as v from 'valibot'

import { apagarCopia, gerarId, readDb, salvarCopia, simularLatencia, writeDb } from '../_mock'
import { requireConta } from '../conta/conta.api'
import { progressoKeys } from '../progresso/progresso.keys'

import { ComprovanteInvalidoError, DownloadInterrompidoError } from './atividades.errors'
import { reduzirComprovante } from './atividades.copia'
import { atividadesKeys } from './atividades.keys'
import { arquivosDaSessao, lerComprovanteMock } from './atividades.mock'
import {
  type Atividade,
  AtividadeSchema,
  type CreateAtividadeInput,
  type LeituraComprovante,
  type ProgressoDownload,
  type UpdateAtividadeInput,
} from './atividades.types'

export const TAMANHO_MAXIMO_COMPROVANTE = 10 * 1024 * 1024
export const TIPOS_COMPROVANTE = ['application/pdf', 'image/jpeg', 'image/png'] as const

export function validarComprovante(arquivo: File): void {
  if (!(TIPOS_COMPROVANTE as readonly string[]).includes(arquivo.type)) {
    throw new ComprovanteInvalidoError('formato')
  }
  if (arquivo.size > TAMANHO_MAXIMO_COMPROVANTE) throw new ComprovanteInvalidoError('tamanho')
}

// A leitura só sugere: nada é gravado aqui.
export async function lerComprovante(arquivo: File): Promise<LeituraComprovante> {
  validarComprovante(arquivo)
  await simularLatencia(2500)
  return lerComprovanteMock(arquivo)
}

// Dados e comprovante entram juntos ou nada entra (RNF24).
export async function createAtividade(input: CreateAtividadeInput): Promise<Atividade> {
  validarComprovante(input.arquivo)
  await simularLatencia(900)
  requireConta()

  const id = gerarId()
  const copia = await reduzirComprovante(input.arquivo)
  const hasCopiaReduzida = copia !== null && salvarCopia(id, copia)

  const atividade = v.parse(AtividadeSchema, {
    id,
    itemNumero: input.itemNumero,
    nome: input.nome.trim(),
    quantidade: input.quantidade,
    dataFim: input.dataFim,
    registradaEm: new Date().toISOString(),
    comprovante: {
      nome: input.arquivo.name,
      tamanhoBytes: input.arquivo.size,
      tipo: input.arquivo.type,
      hasCopiaReduzida,
    },
  })

  try {
    writeDb((db) => {
      db.atividades.push(atividade)
    })
  } catch (error) {
    // Sem espaço para o registro: a cópia sai também, e nada fica pela metade (RNF24).
    apagarCopia(id)
    throw error
  }
  arquivosDaSessao.set(atividade.id, input.arquivo)
  return atividade
}

export async function updateAtividade(input: UpdateAtividadeInput): Promise<Atividade> {
  await simularLatencia(700)
  requireConta()

  const db = writeDb((db) => {
    const atividade = db.atividades.find((a) => a.id === input.id)
    if (!atividade) throw new Error('Atividade não encontrada.')

    Object.assign(atividade, {
      itemNumero: input.itemNumero,
      nome: input.nome.trim(),
      quantidade: input.quantidade,
      dataFim: input.dataFim,
    })
  })

  return v.parse(
    AtividadeSchema,
    db.atividades.find((a) => a.id === input.id),
  )
}

// Apaga a atividade e o comprovante. Não dá para desfazer.
export async function removeAtividade(id: string): Promise<void> {
  await simularLatencia(600)
  requireConta()

  writeDb((db) => {
    db.atividades = db.atividades.filter((a) => a.id !== id)
  })
  arquivosDaSessao.delete(id)
  apagarCopia(id)
}

type BaixarOptions = {
  onProgress: (progresso: ProgressoDownload) => void
  signal: AbortSignal
}

const PASSO_MS = 450

// Simula juntar os comprovantes num .zip com uma pasta por item. O arquivo final ainda não é gerado.
export async function baixarComprovantes(
  ids: readonly string[],
  { onProgress, signal }: BaixarOptions,
): Promise<ProgressoDownload> {
  requireConta()
  const db = readDb()
  const arquivos = db.atividades.filter((a) => ids.includes(a.id))
  const totalBytes = arquivos.reduce((soma, a) => soma + a.comprovante.tamanhoBytes, 0)
  const falhaNoMeio = db.shouldFalharProximoDownload

  if (falhaNoMeio) {
    writeDb((db) => {
      db.shouldFalharProximoDownload = false
    })
  }

  let progresso: ProgressoDownload = {
    arquivosProntos: 0,
    totalArquivos: arquivos.length,
    bytesProntos: 0,
    totalBytes,
  }
  onProgress(progresso)

  for (const [indice, arquivo] of arquivos.entries()) {
    await new Promise((resolve) => setTimeout(resolve, PASSO_MS))
    if (signal.aborted) throw new DOMException('Download cancelado', 'AbortError')
    if (falhaNoMeio && indice === Math.floor(arquivos.length / 2)) {
      throw new DownloadInterrompidoError()
    }

    progresso = {
      ...progresso,
      arquivosProntos: indice + 1,
      bytesProntos: progresso.bytesProntos + arquivo.comprovante.tamanhoBytes,
    }
    onProgress(progresso)
  }

  return progresso
}

// Toda escrita em atividade muda o progresso: painel, atividades, detalhe e formulário (RNF20).
export function invalidateAfterAtividadeWrite(qc: QueryClient): void {
  qc.invalidateQueries({ queryKey: atividadesKeys.all })
  qc.invalidateQueries({ queryKey: progressoKeys.all })
}
