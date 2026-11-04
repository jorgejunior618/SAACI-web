import type { ReactNode } from 'react'

import * as S from './styles'

type Props = {
  title: string
  children?: ReactNode
  actions?: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
  // Dentro de um cartão o fundo vira surface.muted.
  surface?: 'page' | 'card'
  role?: 'status' | 'alert'
}

export function Notice({
  title,
  children,
  actions,
  tone = 'neutral',
  surface,
  role,
}: Props): ReactNode {
  return (
    <S.Box surface={surface} role={role}>
      <p className={S.title({ tone })}>{title}</p>
      {children && <S.Body>{children}</S.Body>}
      {actions && <S.Actions>{actions}</S.Actions>}
    </S.Box>
  )
}
