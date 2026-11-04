export class DownloadInterrompidoError extends Error {
  constructor() {
    super('O download parou no meio.')
    this.name = 'DownloadInterrompidoError'
  }
}

export class ComprovanteInvalidoError extends Error {
  constructor(readonly motivo: 'formato' | 'tamanho') {
    super(
      motivo === 'formato' ? 'Esse arquivo não é PDF, JPG ou PNG.' : 'Esse arquivo passa de 10 MB.',
    )
    this.name = 'ComprovanteInvalidoError'
  }
}
