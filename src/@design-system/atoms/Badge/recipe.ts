// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { cva } from '@/styled-system/css'

export const badge = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    // 20px é o desenho do protótipo; min-height porque altura não se trava em elemento com texto.
    minHeight: '20px',
    // O protótipo pede 6px; a escala de 4px não tem esse valor, então fica em 4px.
    paddingInline: '1',
    borderRadius: 'control',
    background: 'surface.muted',
    textStyle: 'caption',
    whiteSpace: 'nowrap',
  },
  variants: {
    // Só a cor do texto diz o estado: quatro badges juntos não viram um arco-íris de fundos.
    tone: {
      neutral: { color: 'ink.muted' },
      counts: { color: 'brand.text' },
      partial: { color: 'warning' },
      doesNotCount: { color: 'danger' },
    },
  },
  defaultVariants: { tone: 'neutral' },
})
