import { Check, WifiOff } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Icon } from '../../atoms/Icon'
import { Spinner } from '../../atoms/Spinner'
import * as S from './styles'

type StateScreenContentBase = {
  /** Selo curto acima do título, no tom da marca ("Em construção"). Sem ele, a tela começa no título. */
  eyebrow?: string
  /** Fato em poucas palavras. No erro, diz o que não carregou ("Não conseguimos carregar seu painel"). */
  title: string
  /**
   * Texto de apoio. O vazio orienta, nunca diz "Nenhum item encontrado". O erro diz que nada foi
   * perdido, quando for verdade, e o próximo passo.
   */
  description: string
  /** Botões da tela, em coluna: o principal primeiro. A tela escolhe quais e o que fazem. */
  actions?: ReactNode
  /**
   * Número em destaque entre a arte e o título, já formatado ("+10h"). É o número grande da tela:
   * não use junto de outro número grande. Entra com uma animação curta, que some com
   * `prefers-reduced-motion`.
   */
  highlight?: string
}

export type StateScreenEmptyProps = StateScreenContentBase & {
  /** Estado vazio: a arte é o ícone que a tela escolhe, dentro do círculo. */
  variant: 'empty'
  /**
   * Ícone do `lucide-react` que diz o assunto da tela ("Camera", "CalendarCheck"). Passe de um
   * Client Component: o ícone é um objeto e não atravessa a fronteira vinda de um Server Component.
   */
  icon: LucideIcon
}

export type StateScreenOutcomeProps = StateScreenContentBase & {
  /** `success` mostra um check e `connectionError` um wi-fi cortado, os dois dentro do círculo. */
  variant: 'success' | 'connectionError'
}

export type StateScreenContentProps = StateScreenEmptyProps | StateScreenOutcomeProps

export type StateScreenLoadingProps = {
  /** Carregando: spinner grande e uma frase do que está acontecendo. Não tem título nem ações. */
  variant: 'loading'
  /** O que está acontecendo, no gerúndio ("Calculando suas horas"). Também é lido pelo leitor de tela. */
  label: string
}

export type StateScreenProps = StateScreenContentProps | StateScreenLoadingProps

/**
 * Conteúdo de tela inteira para os estados fora do caminho normal: vazio, sucesso, erro de
 * conexão e carregando.
 *
 * @remarks
 * O componente dá a estrutura e a arte; título, texto e ações são da tela. A arte é um ícone de 28px
 * num círculo de 56px com borda fina: `brand.text` no vazio e no sucesso, `danger` no erro. O
 * símbolo do Saci não é arte de estado. Com `highlight`, um número de 56px em `brand.text` entra entre
 * a arte e o título, como o "+10h" da atividade registrada. Em `loading` o spinner fica sem círculo e já é um
 * `role="status"`, então o texto visível fica fora da leitura para não repetir.
 *
 * @example
 * ```tsx
 * <StateScreen
 *   variant="empty"
 *   icon={CalendarCheck}
 *   eyebrow="Em construção"
 *   title="Eventos está chegando"
 *   description="Em breve você vê aqui palestras e cursos que contam horas."
 * />
 *
 * <StateScreen
 *   variant="connectionError"
 *   title="Não conseguimos carregar seu painel"
 *   description="Suas atividades continuam salvas. Confira sua internet e tente de novo."
 *   actions={<Button variant="secondary" block>Tentar de novo</Button>}
 * />
 * ```
 */
export function StateScreen(props: StateScreenProps): ReactNode {
  if (props.variant === 'loading') {
    return (
      <S.Root>
        <S.Art variant="loading">
          <Spinner size="lg" label={props.label} />
        </S.Art>
        <S.Label aria-hidden="true">{props.label}</S.Label>
      </S.Root>
    )
  }

  const { variant, eyebrow, title, description, actions, highlight } = props
  const glyph = props.variant === 'empty' ? props.icon : variant === 'success' ? Check : WifiOff

  return (
    <S.Root>
      <S.Art variant={variant}>
        <Icon icon={glyph} size="xl" />
      </S.Art>
      {highlight ? <S.Highlight>{highlight}</S.Highlight> : null}
      {eyebrow ? <S.Eyebrow>{eyebrow}</S.Eyebrow> : null}
      <S.Title>{title}</S.Title>
      <S.Description>{description}</S.Description>
      {actions ? <S.Actions>{actions}</S.Actions> : null}
    </S.Root>
  )
}

/** Props do `LoadingState`. */
export type LoadingStateProps = Pick<StateScreenLoadingProps, 'label'>

/**
 * Carregamento de tela inteira: o `StateScreen` na variante `loading`, num atalho.
 *
 * @remarks
 * Tem uma origem só: não desenha nada além do que o `StateScreen` desenha.
 *
 * @example
 * ```tsx
 * <LoadingState label="Calculando suas horas" />
 * ```
 */
export function LoadingState({ label }: LoadingStateProps): ReactNode {
  return <StateScreen variant="loading" label={label} />
}
