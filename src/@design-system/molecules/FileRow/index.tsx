import { File } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card } from '../../atoms/Card'
import { Icon } from '../../atoms/Icon'
import * as S from './styles'

type Props = {
  name: string
  size: string
  // Ações de texto: "Trocar", "Ver" e "Baixar", "Abrir".
  actions?: ReactNode
}

export function FileRow({ name, size, actions }: Props): ReactNode {
  return (
    <Card padding="none">
      <S.Row>
        <Icon icon={File} />
        <S.Main>
          <S.Name title={name}>{name}</S.Name>
          <S.Size>{size}</S.Size>
        </S.Main>
        {actions && <S.Actions>{actions}</S.Actions>}
      </S.Row>
    </Card>
  )
}
