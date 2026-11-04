import type { ReactNode } from 'react'

import { Button, Card } from '@design-system'

import type { Item } from '@/services/cursos'

import * as S from './styles'

type Props = {
  item: Item
  onConfirmar: () => void
  onEscolherOutro: () => void
}

// A leitura só sugere: o aluno confirma ou escolhe outro item.
export function Sugestao({ item, onConfirmar, onEscolherOutro }: Props): ReactNode {
  return (
    <Card aria-label="Sugestão de item">
      <S.Question>Parece ser este item. É esse mesmo?</S.Question>
      <S.Item>
        <S.Number>Item {item.numero}</S.Number>
        <S.Name>{item.nome}</S.Name>
        <S.Rule>{item.regraResumo}</S.Rule>
      </S.Item>
      <S.Actions>
        <Button onClick={onConfirmar}>É esse</Button>
        <Button variant="secondary" onClick={onEscolherOutro}>
          Escolher outro
        </Button>
      </S.Actions>
    </Card>
  )
}
