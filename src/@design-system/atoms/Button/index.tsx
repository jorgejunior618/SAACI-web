// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { LucideIcon } from 'lucide-react'
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

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
  /**
   * Elemento ou componente que desenha o botão. Padrão: `button`. Para um botão que navega, passe
   * `'a'` ou o `Link` do `next/link` junto com `href`; o design system não importa o roteador.
   */
  as?: ElementType
  /** Destino quando o botão é um link (`as`). Sem `as`, não tem efeito. */
  href?: string
  /** Texto com verbo, sem caixa alta ("Registrar", "Ver meu progresso"). */
  children: ReactNode
}

/**
 * Dispara uma ação. Tem 48px de altura e quatro papéis, do mais importante ao mais discreto.
 *
 * @remarks
 * `busy` não usa o atributo `disabled`: o botão continua com a mesma cor e não repassa o `onClick`,
 * para não gerar envio duplo. Também vira `type="button"`, então não envia o formulário. Esse
 * bloqueio vale para clique e teclado, mas um `onClick` em elemento pai ainda dispara. Com `as` o botão
 * vira link: `type` não é repassado e `busy` e `disabled` não impedem a navegação, então use link-botão
 * só para ir a outra tela. Use `disabled` apenas para ação impossível; campo vazio não desabilita o botão, o envio aponta o campo. O tipo padrão é
 * `button`, então dentro de `<form>` passe `type="submit"` no botão que envia.
 *
 * @example
 * ```tsx
 * <Button type="submit" block busy={isPending} busyLabel="Registrando">
 *   Registrar atividade
 * </Button>
 *
 * <Button as={NextLink} href="/formulario" block>
 *   Ver como entregar seu pedido
 * </Button>
 * ```
 */
export function Button({
  as,
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
      as={as}
      type={as ? undefined : busy ? 'button' : type}
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
