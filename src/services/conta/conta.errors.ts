export class SenhaNaoConfereError extends Error {
  constructor() {
    super('A senha não confere com este e-mail.')
    this.name = 'SenhaNaoConfereError'
  }
}

export class EmailJaCadastradoError extends Error {
  constructor() {
    super('Este e-mail já tem uma conta.')
    this.name = 'EmailJaCadastradoError'
  }
}

export class EmailNaoInstitucionalError extends Error {
  constructor() {
    super('Use o e-mail que termina em @aluno.ifce.edu.br.')
    this.name = 'EmailNaoInstitucionalError'
  }
}

export class CursoTravadoError extends Error {
  constructor(readonly totalAtividades: number) {
    super('Com atividades lançadas, o curso fica travado.')
    this.name = 'CursoTravadoError'
  }
}

export class SemSessaoError extends Error {
  constructor() {
    super('Sua sessão terminou. Entre de novo.')
    this.name = 'SemSessaoError'
  }
}
