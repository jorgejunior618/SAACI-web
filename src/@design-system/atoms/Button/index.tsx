import type { LucideIcon } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { Icon } from '../Icon'
import { Spinner } from '../Spinner'
import * as S from './styles'

/** Papel do botão na tela: `primary` é a ação da tela, `danger` apaga de vez. */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger'

export type ButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'children'> & {
  /** Papel do botão. Um `primary` por tela; `danger` só em bottom sheet ou tela de confirmação. Padrão: `primary`. */
  variant?: ButtonVariant
  /** Ocupa a largura toda. É o padrão no rodapé de formulário. */
  block?: boolean
  /** Enquanto envia: mostra o spinner e `busyLabel` no lugar do conteúdo e ignora cliques. */
  busy?: boolean
  /** Texto no gerúndio mostrado enquanto `busy` ("Registrando"). Padrão: "Enviando". */
  busyLabel?: string
  /** Ícone do `lucide-react` antes do texto. Só quando ajuda a reconhecer a ação (câmera em "Tirar foto"). */
  icon?: LucideIcon
  /** Texto com verbo, sem caixa alta ("Registrar", "Ver meu progresso"). */
  children: ReactNode
}

/**
 * Dispara uma ação. Tem 48px de altura e quatro papéis, do mais importante ao mais discreto.
 *
 * @remarks
 * `busy` não usa o atributo `disabled`: o botão continua com a mesma cor e não repassa o `onClick`,
 * para não gerar envio duplo. Também vira `type="button"`, então não envia o formulário. Esse
 * bloqueio vale para clique e teclado, mas um `onClick` em elemento pai ainda dispara. Use `disabled` apenas para
 * ação impossível; campo vazio não desabilita o botão, o envio aponta o campo. O tipo padrão é
 * `button`, então dentro de `<form>` passe `type="submit"` no botão que envia.
 *
 * @example
 * ```tsx
 * <Button type="submit" block busy={isPending} busyLabel="Registrando">
 *   Registrar atividade
 * </Button>
 * ```
 */
export function Button({
  variant = 'primary',
  block = false,
  busy = false,
  busyLabel = 'Enviando',
  icon,
  type = 'button',
  onClick,
  children,
  ...rest
}: ButtonProps): ReactNode {
  return (
    <S.Root
      {...rest}
      type={busy ? 'button' : type}
      variant={variant}
      block={block}
      aria-busy={busy ? true : undefined}
      onClick={busy ? undefined : onClick}
    >
      {busy ? (
        <>
          {/* O status anuncia o gerúndio; o texto visível fica fora da leitura para não repetir. */}
          <Spinner size="sm" label={busyLabel} />
          <span aria-hidden="true">{busyLabel}</span>
        </>
      ) : (
        <>
          {icon ? <Icon icon={icon} /> : null}
          {children}
        </>
      )}
    </S.Root>
  )
}
