import { describe, expect, it } from 'vitest'

import { nomeDaCopia, reduzirComprovante } from './atividades.copia'

describe('reduzirComprovante', () => {
  it('não copia PDF: só o nome e o tamanho ficam guardados', async () => {
    const pdf = new File(['%PDF-1.7'], 'certificado.pdf', { type: 'application/pdf' })

    expect(await reduzirComprovante(pdf)).toBeNull()
  })
})

describe('nomeDaCopia', () => {
  it('avisa no nome que o arquivo baixado é a cópia reduzida', () => {
    expect(nomeDaCopia('declaracao-palestra.png')).toBe('declaracao-palestra-copia-reduzida.jpg')
  })
})
