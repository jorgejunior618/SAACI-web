// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Specimens = styled('div', {
  base: {
    display: 'grid',
    gap: '4',
    gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))',
  },
})

// O Specimen centraliza o conteúdo; a barra precisa ocupar a largura inteira do quadro.
export const Frame = styled('div', {
  base: { width: '100%', background: 'surface.sunken' },
})

// Janela com rolagem própria: a borda da barra segue a rolagem dela, não a da galeria.
export const Window = styled('div', {
  base: { width: '100%', height: '16rem', overflowY: 'auto', background: 'surface.sunken' },
})

export const Paragraph = styled('p', {
  base: { margin: '0', padding: '4', textStyle: 'body' },
})

export const Sticky = styled('div', {
  base: { position: 'sticky', top: '0' },
})
