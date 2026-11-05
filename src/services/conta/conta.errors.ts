export class SenhaNaoConfereError extends Error {
  constructor() {
    super('A senha não confere com este e-mail.')
    this.name = 'SenhaNaoConfereError'
  }
}
