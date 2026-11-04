import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Icon } from '../../atoms/Icon'
import * as S from './styles'

type Props = {
  icon: LucideIcon
  iconTone?: 'neutral' | 'brand' | 'danger'
  caption?: string
  // Conteúdo grande entre o ícone e o título, como o "+10h" do registro.
  hero?: ReactNode
  title: string
  children?: ReactNode
  actions?: ReactNode
  headingLevel?: 'h1' | 'h2'
}

// Vazio, sucesso, erro, em construção: ícone em círculo, título, texto e ações empilhadas.
export function StateScreen({
  icon,
  iconTone = 'neutral',
  caption,
  hero,
  title,
  children,
  actions,
  headingLevel = 'h2',
}: Props): ReactNode {
  return (
    <S.Wrapper>
      <span className={S.icon({ tone: iconTone })}>
        <Icon icon={icon} size={28} />
      </span>
      {caption && <S.Caption>{caption}</S.Caption>}
      {hero}
      <S.Title as={headingLevel}>{title}</S.Title>
      {children && <S.Text>{children}</S.Text>}
      {actions && <S.Actions>{actions}</S.Actions>}
    </S.Wrapper>
  )
}
