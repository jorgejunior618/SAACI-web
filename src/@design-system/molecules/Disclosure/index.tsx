import { ChevronDown } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { Icon } from '../../atoms/Icon'
import * as S from './styles'

export type DisclosureProps = Omit<ComponentPropsWithoutRef<'details'>, 'open' | 'title'> & {
  /** Título da seção, no cabeçalho ("Outras atividades que contam"). */
  title: string
  /** Quantidade de itens, escrita ao lado do título em `ink.muted`. Sem ela, o contador some. */
  count?: number
  /** Começa aberta. Use no painel vazio, onde a lista é a orientação. Padrão: `false`. */
  defaultOpen?: boolean
  /** O conteúdo: `Disclosure.Row`, ou outras linhas que sejam `li`. */
  children: ReactNode
}

export type DisclosureRowProps = {
  /** Número do item da tabela de atividades, na coluna de 20px à esquerda. */
  itemNumber: number
  /** Nome do item. */
  name: string
  /** Regra resumida abaixo do nome ("40h a cada período letivo, até 80h"). */
  rule?: string
}

/**
 * Linha de item dentro do `Disclosure`: número em coluna própria, nome e regra.
 *
 * @remarks
 * É um `li` sem ação. A divisória começa no nome, não na borda do cartão.
 */
function DisclosureRow({ itemNumber, name, rule }: DisclosureRowProps): ReactNode {
  return (
    <S.Row>
      <S.ItemNumber>{itemNumber}</S.ItemNumber>
      <S.Name>
        {name}
        {rule ? <S.Rule>{rule}</S.Rule> : null}
      </S.Name>
    </S.Row>
  )
}

function DisclosureRoot({
  title,
  count,
  defaultOpen = false,
  children,
  ...rest
}: DisclosureProps): ReactNode {
  return (
    <S.Root {...rest} open={defaultOpen}>
      <S.Summary>
        <S.Title>{title}</S.Title>
        {count === undefined ? null : <S.Count>{count}</S.Count>}
        <S.Arrow data-arrow="">
          <Icon icon={ChevronDown} size="sm" />
        </S.Arrow>
      </S.Summary>
      <S.Body>{children}</S.Body>
    </S.Root>
  )
}

/**
 * Seção que abre e fecha, feita com `details` e `summary`: funciona sem JavaScript e com leitor de tela.
 *
 * @remarks
 * O cabeçalho tem título em peso 500, contador em `ink.muted` e uma seta à direita que gira ao abrir.
 * Use um nível só: sem `Disclosure` dentro de `Disclosure`. Não esconda passo obrigatório aqui, porque
 * a seção é para consulta. As linhas entram como `Disclosure.Row` (item, nome e regra) ou como
 * qualquer `li`, como o `ActivityRow`. `defaultOpen` só vale na primeira renderização: depois, quem
 * manda é o clique do aluno.
 *
 * @example
 * ```tsx
 * <Disclosure title="Outras atividades que contam" count={2} defaultOpen>
 *   <Disclosure.Row itemNumber={1} name="Iniciação científica" rule="40h por período, até 80h" />
 *   <Disclosure.Row itemNumber={3} name="Monitoria" rule="40h por disciplina, até 80h" />
 * </Disclosure>
 * ```
 */
export const Disclosure = Object.assign(DisclosureRoot, { Row: DisclosureRow })
