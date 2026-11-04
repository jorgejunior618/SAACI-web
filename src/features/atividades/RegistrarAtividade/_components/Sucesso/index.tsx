'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button, ButtonLink, Screen, StateScreen, TotalCard } from '@design-system'

import { ROUTES } from '@/constants/routes'
import type { Atividade } from '@/services/atividades'
import { progressoQueries } from '@/services/progresso'
import { formatHorasInteiras } from '@/utils/formatHoras'

import * as S from './styles'

type Props = {
  atividade: Atividade
  onRegistrarOutra: () => void
}

export function Sucesso({ atividade, onRegistrarOutra }: Props): ReactNode {
  const { data: progresso } = useSuspenseQuery(progressoQueries.resumo())
  const contada =
    progresso.itens.flatMap((i) => i.atividades).find((a) => a.id === atividade.id)?.contada ?? 0

  return (
    <Screen gap="none" isCentered label="Atividade registrada">
      <StateScreen
        icon={Check}
        iconTone="brand"
        hero={<S.Hero>+{formatHorasInteiras(contada)}</S.Hero>}
        title="Atividade registrada"
        headingLevel="h1"
      >
        <p>
          {atividade.nome} entrou no item {atividade.itemNumero}.
          {contada === 0 && ' Ela fica guardada, mas não soma horas.'}
        </p>
      </StateScreen>
      <S.Total>
        <TotalCard
          size="compact"
          feito={progresso.total.feito}
          meta={progresso.total.meta}
          faltam={progresso.total.faltam}
        />
      </S.Total>
      <S.Actions>
        <Button isBlock onClick={onRegistrarOutra}>
          Registrar outra
        </Button>
        <ButtonLink href={ROUTES.painel} variant="secondary" isBlock>
          Ver meu progresso
        </ButtonLink>
      </S.Actions>
    </Screen>
  )
}
