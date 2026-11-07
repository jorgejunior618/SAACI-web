import { describe, expect, it } from 'vitest'

import { formatFileSize, validateFile } from './utils'

const ACCEPT = ['application/pdf', 'image/jpeg', 'image/png']

function makeFile(type: string, size: number): File {
  const file = new File(['x'], 'arquivo', { type })

  // O conteúdo real não importa, só o tamanho que o navegador informa.
  Object.defineProperty(file, 'size', { value: size })

  return file
}

describe('formatFileSize', () => {
  it('escreve em B, KB e MB com vírgula decimal', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2 KB')
    expect(formatFileSize(1.2 * 1024 * 1024)).toBe('1,2 MB')
  })
})

describe('validateFile', () => {
  it('aceita tipo e tamanho dentro do limite', () => {
    expect(validateFile(makeFile('application/pdf', 1024), ACCEPT, 10)).toBeNull()
  })

  it('aceita o arquivo exatamente no limite', () => {
    expect(validateFile(makeFile('application/pdf', 10 * 1024 * 1024), ACCEPT, 10)).toBeNull()
  })

  it('recusa acima do limite, dizendo o tamanho e o limite', () => {
    const message = validateFile(makeFile('application/pdf', 10 * 1024 * 1024 + 1), ACCEPT, 10)

    expect(message).toContain('limite é 10 MB')
    expect(message).toContain('Escolha um arquivo menor')
  })

  it('recusa tipo fora da lista, nomeando os aceitos', () => {
    expect(validateFile(makeFile('image/gif', 1024), ACCEPT, 10)).toBe(
      'Esse tipo de arquivo não funciona aqui. Envie em PDF, JPG ou PNG.',
    )
  })

  it('recusa arquivo vazio', () => {
    expect(validateFile(makeFile('application/pdf', 0), ACCEPT, 10)).toContain('vazio')
  })
})
