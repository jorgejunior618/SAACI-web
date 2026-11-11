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

/** O serviço de leitura não conseguiu ler o comprovante. A tela deixa preencher à mão. */
export class UnreadableProofError extends Error {
  constructor() {
    super('Não conseguimos ler o comprovante.')
    this.name = 'ComprovanteIlegivelError'
  }
}
