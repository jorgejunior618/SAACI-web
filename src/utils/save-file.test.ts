import { afterEach, describe, expect, it, vi } from 'vitest'

import { saveFile } from './save-file'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('saveFile', () => {
  it('baixa o arquivo com o nome dado e libera o endereço depois de um minuto', () => {
    vi.useFakeTimers()
    URL.createObjectURL = vi.fn(() => 'blob:arquivo')
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    const created = vi.spyOn(document, 'createElement')

    saveFile(new Blob(['%PDF']), 'formulario.pdf')

    const link = created.mock.results[0]?.value as HTMLAnchorElement

    expect(link.download).toBe('formulario.pdf')
    expect(link.href).toBe('blob:arquivo')
    expect(click).toHaveBeenCalledOnce()
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()

    vi.advanceTimersByTime(60_000)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:arquivo')
  })
})
