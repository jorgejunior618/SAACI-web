// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import * as S from './styles'

export type AppFrameProps = {
  /** Conteúdo da tela. Fica dentro do `main`, que ocupa o espaço entre as barras. */
  children: ReactNode
  /** Barra de topo, normalmente a `TopBar`. Fica colada no topo ao rolar. Sem ela, a região não existe. */
  topBar?: ReactNode
  /** Barra inferior, normalmente a `BottomNav`. Fica colada na base ao rolar. Sem ela, a região não existe. */
  bottomNav?: ReactNode
}

/**
 * Moldura de toda tela do app: uma coluna de até 480px, centralizada, com o fundo `surface.sunken`.
 *
 * @remarks
 * Em tela larga o conteúdo continua na mesma coluna; não há layout próprio de desktop. A rolagem é a
 * da página, então a barra de endereço do iOS recolhe normalmente: as barras usam `position: sticky`
 * em vez de `fixed`. Quem desenha o espaço da área segura de cima e de baixo são `TopBar` e
 * `BottomNav`; a moldura cuida só das laterais. Qual destino da barra inferior está ativo é decisão
 * de quem monta a tela.
 *
 * @example
 * ```tsx
 * <AppFrame topBar={<TopBar variant="inner" title="Registrar" />} bottomNav={<BottomNav {...nav} />}>
 *   <Registrar />
 * </AppFrame>
 * ```
 */
export function AppFrame({ children, topBar, bottomNav }: AppFrameProps): ReactNode {
  return (
    <S.Root>
      {topBar ? <S.Top>{topBar}</S.Top> : null}
      <S.Main>{children}</S.Main>
      {bottomNav ? <S.Bottom>{bottomNav}</S.Bottom> : null}
    </S.Root>
  )
}
