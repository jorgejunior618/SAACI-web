// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { describe, expect, it } from 'vitest'

import { formatFileSize } from './format-file-size'

describe('formatFileSize', () => {
  it('escreve em B, KB e MB com vírgula decimal', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2 KB')
    expect(formatFileSize(1.2 * 1024 * 1024)).toBe('1,2 MB')
  })
})
