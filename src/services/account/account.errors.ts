/**
 * E-mail desconhecido ou senha errada. A mensagem é a mesma para os dois de propósito: dizer qual
 * errou ajudaria quem tenta descobrir e-mails de aluno.
 */
export class InvalidCredentialsError extends Error {
  constructor() {
    super('A senha não confere com este e-mail.')
    this.name = 'SenhaNaoConfereError'
  }
}

/** Já existe conta com este e-mail. A tela leva a Entrar ou a recuperar a senha. */
export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('Este e-mail já tem uma conta.')
    this.name = 'EmailJaCadastradoError'
  }
}

/** A conta existe, mas o aluno ainda não tocou no link do e-mail. A tela leva a Confirme seu e-mail. */
export class EmailNotConfirmedError extends Error {
  constructor() {
    super('Falta confirmar o e-mail.')
    this.name = 'EmailNaoConfirmadoError'
  }
}

/** O link de confirmação ou de nova senha venceu ou já foi trocado por um mais novo. */
export class ExpiredLinkError extends Error {
  constructor() {
    super('Este link não vale mais.')
    this.name = 'LinkExpiradoError'
  }
}

/** O e-mail não termina em `@aluno.ifce.edu.br`. A mesma regra vale no servidor (RF02). */
export class EmailDomainError extends Error {
  constructor() {
    super('Use o e-mail de aluno, o que termina em @aluno.ifce.edu.br.')
    this.name = 'EmailForaDoDominioError'
  }
}
