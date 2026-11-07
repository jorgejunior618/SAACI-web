import { Check, WifiOff } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'

import { Icon } from '../../atoms/Icon'
import { Spinner } from '../../atoms/Spinner'
import * as S from './styles'

export type StateScreenContentProps = {
  /**
   * Qual estado a tela mostra e, com ele, a arte. `empty` usa o símbolo do SAACI, `success` um check
   * e `connectionError` um wi-fi cortado.
   */
  variant: 'empty' | 'success' | 'connectionError'
  /** Fato em poucas palavras. No erro, diz o que não carregou ("Não conseguimos carregar seu painel"). */
  title: string
  /**
   * Texto de apoio. O vazio orienta, nunca diz "Nenhum item encontrado". O erro diz que nada foi
   * perdido, quando for verdade, e o próximo passo.
   */
  description: string
  /** Botões da tela, em coluna: o principal primeiro. A tela escolhe quais e o que fazem. */
  actions?: ReactNode
}

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
 * O componente dá a estrutura e a arte; título, texto e ações são da tela. A arte não ganha círculo
 * de fundo. O símbolo do Saci aparece só no vazio e nunca no erro. Em `loading` o spinner já é um
 * `role="status"`, então o texto visível fica fora da leitura para não repetir.
 *
 * @example
 * ```tsx
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

  const { variant, title, description, actions } = props

  return (
    <S.Root>
      <S.Art variant={variant}>
        {variant === 'empty' ? (
          <Image className={S.symbol} src="/logo-simbolo.png" width={56} height={56} alt="" />
        ) : (
          <Icon icon={variant === 'success' ? Check : WifiOff} size="xl" />
        )}
      </S.Art>
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
