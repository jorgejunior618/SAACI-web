import type { ReactNode } from 'react'

import * as S from './styles'

type Props = {
  topBar?: ReactNode
  children: ReactNode
  footer?: ReactNode
  gap?: 'none' | 'md'
  isCentered?: boolean
  surface?: 'sunken' | 'muted'
  // Rótulo da área principal quando a tela não tem <h1> visível.
  label?: string
}

// Topo fixo, conteúdo, rodapé de ação. A barra inferior vem do layout do grupo de rota.
export function Screen({
  topBar,
  children,
  footer,
  gap,
  isCentered,
  surface,
  label,
}: Props): ReactNode {
  return (
    <S.Wrapper>
      {topBar}
      <S.Main gap={gap} isCentered={isCentered} surface={surface} aria-label={label}>
        {children}
      </S.Main>
      {footer}
    </S.Wrapper>
  )
}
