import { Flag } from 'lucide-react'
import NextLink from 'next/link'
import { useId } from 'react'
import type { ReactNode } from 'react'

import { Button, Card, Icon, Link } from '@design-system'

import { formatHours } from '@/utils/format-hours'

import * as S from './styles'

type FirstStepsProps = {
  /** Meta de horas do curso, já vinda do service. Aparece no título e no último passo ("120h"). */
  targetHours: number
}

/**
 * Mostra o caminho do primeiro acesso em três passos: registrar, ver o cálculo e entregar o pedido.
 *
 * @remarks
 * Só o primeiro passo é um cartão, com o botão que leva ao Registrar. Os outros dois são texto, e o
 * terceiro traz o link "Ver como entregar", que leva ao guia de entrega (Como entregar). É local da
 * tela Início: nasceu sem especificação no `DS_REFERENCE.md`. Promova só se outra tela repetir o
 * padrão.
 *
 * @example
 * ```tsx
 * <FirstSteps targetHours={progress.targetHours} />
 * ```
 */
export function FirstSteps({ targetHours }: FirstStepsProps): ReactNode {
  const titleId = useId()
  const goal = formatHours(targetHours, { fractionDigits: 0 })

  return (
    <S.Root aria-labelledby={titleId}>
      <S.Title id={titleId}>Seu caminho até as {goal}</S.Title>
      <S.List>
        <S.Step>
          <S.Rail aria-hidden="true">
            <S.Marker state="current">1</S.Marker>
            <S.Line />
          </S.Rail>
          <Card>
            <S.Eyebrow>Você está aqui</S.Eyebrow>
            <S.StepTitle>Registre uma atividade</S.StepTitle>
            <S.StepText>Tire uma foto do comprovante e o app sugere o item.</S.StepText>
            <S.Action>
              <Button as={NextLink} href="/registrar" block>
                Registrar a primeira atividade
              </Button>
            </S.Action>
          </Card>
        </S.Step>
        <S.Step>
          <S.Rail aria-hidden="true">
            <S.Marker>2</S.Marker>
            <S.Line />
          </S.Rail>
          <S.Text>
            <S.StepTitle>O SAACI calcula as horas</S.StepTitle>
            <S.StepText>
              Pela regra do seu curso, e mostra quanto ainda cabe em cada item.
            </S.StepText>
          </S.Text>
        </S.Step>
        <S.Step>
          <S.Rail aria-hidden="true">
            <S.Marker>
              <Icon icon={Flag} size="sm" />
            </S.Marker>
          </S.Rail>
          <S.Text>
            <S.StepTitle>Você entrega o pedido</S.StepTitle>
            <S.StepText>
              Com {goal}, o formulário fica pronto e os certificados separados para a coordenação.
            </S.StepText>
            <Link as={NextLink} href="/atividades/pedido/como-entregar" isStandalone>
              Ver como entregar
            </Link>
          </S.Text>
        </S.Step>
      </S.List>
    </S.Root>
  )
}
