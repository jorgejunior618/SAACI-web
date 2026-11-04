import { describe, expect, it } from 'vitest'

import { formatTamanho } from './formatTamanho'

describe('formatTamanho', () => {
  it('usa KB abaixo de 1 MB', () => {
    expect(formatTamanho(420 * 1024)).toBe('420 KB')
  })

  it('usa MB com uma casa decimal', () => {
    expect(formatTamanho(1.2 * 1024 * 1024)).toBe('1,2 MB')
  })
})
