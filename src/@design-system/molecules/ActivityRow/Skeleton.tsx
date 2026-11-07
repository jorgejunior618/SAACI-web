import type { ReactNode } from 'react'

import * as S from './skeleton.styles'

/**
 * Esqueleto do `ActivityRow` enquanto a lista carrega, com a altura de título mais metadados.
 *
 * @remarks
 * É um `li`, então entra na mesma lista da linha real. Escondido de leitor de tela: o aviso de
 * carregamento é da tela. Com `prefers-reduced-motion` o pulso roda uma vez só.
 */
export function ActivityRowSkeleton(): ReactNode {
  return (
    <S.Root aria-hidden="true">
      <S.Texts>
        <S.Title />
        <S.Meta />
      </S.Texts>
    </S.Root>
  )
}
