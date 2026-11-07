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

/** O serviço de leitura não conseguiu ler o comprovante. A tela deixa preencher à mão. */
export class UnreadableProofError extends Error {
  constructor() {
    super('Não conseguimos ler o comprovante.')
    this.name = 'ComprovanteIlegivelError'
  }
}
