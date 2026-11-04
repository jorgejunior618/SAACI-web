import type { ReactNode } from 'react'

import { ThemeToggle } from '../../atoms/ThemeToggle'
import * as S from './styles'

type Props = {
  children: ReactNode
  hasNav?: boolean
}

// Toda tela passa por aqui, então é aqui que o botão do modo escuro entra, uma vez só.
export function AppFrame({ children, hasNav }: Props): ReactNode {
  return (
    <S.Frame hasNav={hasNav}>
      <ThemeToggle />
      {children}
    </S.Frame>
  )
}
