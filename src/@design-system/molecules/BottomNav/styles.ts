// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Root = styled('nav', {
  base: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: '1fr',
    // 60px mais a área segura de baixo (o indicador do iPhone); mínima, para o rótulo poder crescer.
    minHeight: 'calc(token(sizes.bottomnav) + env(safe-area-inset-bottom))',
    paddingBottom: 'env(safe-area-inset-bottom)',
    background: 'surface',
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'line',
  },
})

export const Item = styled('a', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1',
    minWidth: '0',
    minHeight: 'touch',
    color: 'ink.muted',
    textStyle: 'caption',
    textDecoration: 'none',
    WebkitTapHighlightColor: 'transparent',
    '&[aria-current="page"]': {
      color: 'brand.text',
      fontWeight: '600',
      // O Icon fixa 1,5 no atributo; o CSS do ativo engrossa o traço para 2.
      '& svg': { strokeWidth: '2' },
    },
  },
})

// Registrar: círculo de 48px que sobe acima da barra. A borda de 4px em `surface` recorta o círculo
// da linha superior; o traço do ícone em 2 acompanha o do item ativo. Não é aba, então não tem
// estado ativo, só o pressionado.
export const ActionDisc = styled('span', {
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '48px',
    height: '48px',
    marginBlockStart: '-22px',
    borderRadius: 'full',
    borderWidth: '4px',
    borderStyle: 'solid',
    borderColor: 'surface',
    background: 'brand',
    color: 'brand.on',
    '& svg': { strokeWidth: '2' },
    'a:active &': { background: 'brand.pressed' },
  },
})

// O ícone parado é mais claro que o rótulo; o ativo herda a cor do item.
export const IconSlot = styled('span', {
  base: {
    display: 'inline-flex',
    color: 'ink.subtle',
    'a[aria-current="page"] &': { color: 'inherit' },
  },
})
