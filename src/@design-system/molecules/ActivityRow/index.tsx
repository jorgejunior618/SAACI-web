import { ChevronRight } from 'lucide-react'
import type { ElementType, ReactNode } from 'react'

import { formatHours } from '@/utils/format-hours'

import { Icon } from '../../atoms/Icon'
import * as S from './styles'

/** Seleção em lote: o estado é da tela, o componente só desenha o checkbox. */
export type ActivityRowSelection = {
  /** Se a atividade está marcada. */
  checked: boolean
  /** Chamado ao marcar ou desmarcar. */
  onChange: (checked: boolean) => void
}

/** Linha que navega: o toque em qualquer ponto leva a `href`, e a seta à direita indica isso. */
type ActivityRowNavigationProps = {
  /** Destino do toque, em geral o detalhe da atividade. */
  href: string
  /** Elemento que desenha o link, como em `Link.as` (o `Link` do `next/link`). Padrão: `a`. */
  linkAs?: ElementType
  selection?: never
}

/**
 * Linha do modo de seleção: o toque em qualquer ponto marca ou desmarca. Não navega e não tem seta,
 * para o aluno não sair da tela no meio da seleção.
 */
type ActivityRowSelectionProps = {
  /** Liga o checkbox de 18px e faz a linha inteira marcar e desmarcar. */
  selection: ActivityRowSelection
  href?: never
  linkAs?: never
}

type ActivityRowBaseProps = {
  /** Nome da atividade. Em uma linha só, com reticências. Também nomeia o checkbox. */
  title: string
} & (ActivityRowNavigationProps | ActivityRowSelectionProps)

type ActivityRowCountsProps = ActivityRowBaseProps & {
  /** Conta por inteiro: duração em cinza. */
  status: 'counts'
  /** Horas da atividade, que contam por inteiro. */
  countedHours: number
  /** Data de término, já formatada ("12/03/2025"). */
  endDate: string
}

type ActivityRowPartialProps = ActivityRowBaseProps & {
  /** Conta em parte: "1,0h de 2,0h" em `warning`. */
  status: 'partial'
  /** Horas que contam. */
  countedHours: number
  /** Horas da atividade, no total. */
  activityHours: number
  /** Data de término, já formatada ("20/09/2025"). */
  endDate: string
}

type ActivityRowDoesNotCountProps = ActivityRowBaseProps & {
  /** Não conta: "Não conta" em `danger` e o motivo em cinza. */
  status: 'doesNotCount'
  /** Motivo em poucas palavras ("antes do seu ingresso"). */
  reason: string
}

export type ActivityRowProps =
  ActivityRowCountsProps | ActivityRowPartialProps | ActivityRowDoesNotCountProps

function Separator(): ReactNode {
  return (
    <>
      {' '}
      <S.Dot aria-hidden="true">·</S.Dot>{' '}
    </>
  )
}

function Metadata(props: ActivityRowProps): ReactNode {
  switch (props.status) {
    case 'counts':
      return (
        <>
          <span>{formatHours(props.countedHours)}</span>
          <Separator />
          <span>{props.endDate}</span>
        </>
      )
    case 'partial':
      return (
        <>
          <S.Partial>
            {formatHours(props.countedHours)} de {formatHours(props.activityHours)}
          </S.Partial>
          <Separator />
          <span>{props.endDate}</span>
        </>
      )
    case 'doesNotCount':
      return (
        <>
          <S.Danger>Não conta</S.Danger>
          <Separator />
          <span>{props.reason}</span>
        </>
      )
  }
}

/**
 * Linha de atividade registrada: título em uma linha e metadados em cinza, com o estado dito pela
 * cor da duração.
 *
 * @remarks
 * É um `li`: use dentro de um `ul` (a lista com borda é da tela). Não há badge. `counts` escreve
 * tudo em cinza, `partial` pinta "1,0h de 2,0h" de `warning` e `doesNotCount` pinta "Não conta" de
 * `danger` com o motivo em cinza. O `status` chega pronto; o componente não decide o que conta.
 * Fora do modo de seleção, o link cobre título, metadados e seta. Com `selection`, a linha inteira é
 * o rótulo do checkbox: tocar em qualquer ponto marca ou desmarca, e não há link nem seta. O tipo
 * recusa `href` junto com `selection`. O checkbox leva o título no `aria-label`.
 * Ordenar por data de término é da tela, e remover fica no detalhe, nunca por gesto de arrastar.
 *
 * @example
 * ```tsx
 * <ul>
 *   <ActivityRow status="counts" title="Palestra sobre computação quântica" countedHours={2} endDate="12/03/2025" href="/atividades/1" />
 *   <ActivityRow status="doesNotCount" title="Palestra de boas-vindas" reason="antes do seu ingresso" href="/atividades/2" />
 * </ul>
 *
 * <ul>
 *   <ActivityRow status="counts" title="Curso de Git" countedHours={8} endDate="03/05/2025" selection={{ checked, onChange: setChecked }} />
 * </ul>
 * ```
 */
export function ActivityRow(props: ActivityRowProps): ReactNode {
  const { title, selection } = props
  const texts = (
    <S.Texts>
      <S.Title>{title}</S.Title>
      <S.Meta>
        <Metadata {...props} />
      </S.Meta>
    </S.Texts>
  )

  if (selection) {
    return (
      <S.Root selectable>
        <S.SelectMain>
          <S.Check>
            <S.Input
              type="checkbox"
              aria-label={`Selecionar ${title}`}
              checked={selection.checked}
              onChange={(event) => {
                selection.onChange(event.target.checked)
              }}
            />
          </S.Check>
          {texts}
        </S.SelectMain>
      </S.Root>
    )
  }

  return (
    <S.Root>
      <S.Main as={props.linkAs} href={props.href}>
        {texts}
        <S.Arrow>
          <Icon icon={ChevronRight} size="sm" />
        </S.Arrow>
      </S.Main>
    </S.Root>
  )
}
