// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { END_BEFORE_START_MESSAGE } from './activities.types'

/** A atividade não existe ou é de outro aluno. A tela mostra o "não encontrado" da entidade. */
export class ActivityNotFoundError extends Error {
  constructor() {
    super('Não encontramos esta atividade.')
    this.name = 'AtividadeNaoEncontradaError'
  }
}

/**
 * A atividade mudou depois que o aluno abriu a tela (`updatedAt` não bate). A tela pede para
 * abrir de novo, sem perder o que foi digitado.
 */
export class StaleActivityError extends Error {
  constructor() {
    super('Esta atividade mudou desde que você a abriu.')
    this.name = 'AtividadeDesatualizadaError'
  }
}

/**
 * A correção deixaria a data de fim antes da de início. Acontece quando o aluno corrige só uma das
 * datas. A tela mostra a mensagem junto às datas.
 */
export class InvalidActivityDatesError extends Error {
  constructor() {
    super(END_BEFORE_START_MESSAGE)
    this.name = 'DatasDaAtividadeInvalidasError'
  }
}

/**
 * O item escolhido não existe nas regras do curso do aluno (FK composta para `itens_curso`). Só
 * acontece se a tela oferecer um item fora da matriz. A tela mostra a mensagem junto ao item.
 */
export class InvalidActivityItemError extends Error {
  constructor() {
    super('Este item não está nas regras do seu curso. Escolha um item da lista.')
    this.name = 'ItemDaAtividadeInvalidoError'
  }
}

/**
 * O arquivo do comprovante não chegou (rede caiu ou o Storage recusou). A tela diz que nada foi
 * salvo e deixa tentar de novo.
 */
export class ProofDownloadError extends Error {
  constructor() {
    super('Não conseguimos baixar o comprovante.')
    this.name = 'ComprovanteNaoBaixadoError'
  }
}

/**
 * Nome do `check` de datas na migration `atividades`. O SQLSTATE `23514` vale para todo `check`, então
 * é o nome que diz que o problema é a data.
 */
const DATES_CHECK = 'atividades_datas_check'

/**
 * Nome da FK composta `(curso_id, item_numero)` na migration `atividades`, o padrão do Postgres. O
 * SQLSTATE `23503` vale para toda FK (há também a de `aluno_id`), então é o nome que diz que é o item.
 */
const ITEM_FOREIGN_KEY = 'atividades_curso_id_item_numero_fkey'

/**
 * Traduz o erro do banco para o erro de domínio das atividades, quando conhece a causa.
 *
 * @remarks
 * Só traduz o que conhece. Erro de rede ou qualquer outro volta intacto, para uma falha de conexão
 * nunca virar "corrija as datas" na tela.
 *
 * @param error Erro devolvido pelo `supabase-js`.
 * @returns `InvalidActivityDatesError` para o `check` de datas, `InvalidActivityItemError` para o
 * item fora da matriz do curso, ou o próprio `error` nos demais casos.
 *
 * @example
 * if (error) throw toActivityError(error)
 */
export function toActivityError<E extends { code?: string; message?: string }>(
  error: E,
): InvalidActivityDatesError | InvalidActivityItemError | E {
  if (error.code === '23514' && error.message?.includes(DATES_CHECK)) {
    return new InvalidActivityDatesError()
  }
  if (error.code === '23503' && error.message?.includes(ITEM_FOREIGN_KEY)) {
    return new InvalidActivityItemError()
  }
  return error
}

/**
 * Diz se o erro é uma recusa do banco, e não uma falha de rede.
 *
 * @remarks
 * Uso interno do domínio. Recusa traz código: SQLSTATE do Postgres (`23503`, `SA024`) ou do PostgREST
 * (`PGRST…`). Falha de rede, cancelamento e resposta que não é JSON chegam sem código no
 * `supabase-js` (conferido no postgrest-js 2.119). Numa escrita, sem código não se sabe se o commit
 * aconteceu: a requisição pode ter chegado e só a resposta se perdido.
 *
 * @param error Qualquer valor lançado ou devolvido pelo `supabase-js`.
 * @returns `true` quando o erro traz um código não vazio.
 */
export function isDatabaseRejection(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    error.code !== ''
  )
}

/** O serviço de leitura não conseguiu ler o comprovante. A tela deixa preencher à mão. */
export class UnreadableProofError extends Error {
  constructor() {
    super('Não conseguimos ler o comprovante.')
    this.name = 'ComprovanteIlegivelError'
  }
}
